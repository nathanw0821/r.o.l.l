import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { assistPresetContent } from "@/lib/session-assist-presets";
import { z } from "zod";

const candidateSchema = z.object({
  effectTierId: z.string().min(1),
  effectName: z.string().min(1),
  tierLabel: z.string().min(1),
  categories: z.array(z.string().min(1)).max(8)
});

const requestSchema = z.object({
  apiKey: z.string().min(20),
  imageDataUrl: z.string().startsWith("data:image/"),
  candidates: z.array(candidateSchema).min(1).max(120),
  assistPreset: z.enum(["manual", "session", "ai"]).optional()
});

const responseFormat = {
  type: "json_schema",
  name: "session_assist_matches",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      matches: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            effectTierId: { type: "string" },
            reason: { type: "string" }
          },
          required: ["effectTierId", "reason"]
        }
      },
      caution: { type: "string" }
    },
    required: ["matches", "caution"]
  }
} as const;

export async function POST(request: Request) {
  // The user's own OpenAI key passes through here, so only signed-in users, rate limited, and the
  // upstream error body is never echoed back (it would make this an anonymous key-checking proxy).
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Sign in to use screenshot assist." } },
      { status: 401 }
    );
  }
  const limiter = await rateLimit(`session-assist:${session.user.id}`, 10, 60_000);
  if (!limiter.success) {
    return NextResponse.json(
      { success: false, error: { code: "RATE_LIMITED", message: "Too many requests. Please wait a moment." } },
      { status: 429 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_JSON", message: "Invalid JSON body." } },
      { status: 400 }
    );
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid Session Assist payload.",
          details: parsed.error.flatten()
        }
      },
      { status: 400 }
    );
  }

  const { apiKey, imageDataUrl, candidates, assistPreset = "manual" } = parsed.data;
  const candidateIds = new Set(candidates.map((candidate) => candidate.effectTierId));
  const presetContent = assistPresetContent[assistPreset];

  const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_output_tokens: 500,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                `You help manually review Fallout 76 legendary screenshot uploads. Only return candidate effectTierIds that are clearly supported by the screenshot. If you are unsure, leave the effect out. Never invent ids outside the candidate list. ${presetContent.analysisGuidance}`
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Review this screenshot and suggest only clearly visible legendary unlock matches from the candidate list below.\n\nCandidate list:\n${JSON.stringify(
                candidates
              )}\n\nReturn concise reasons.`
            },
            {
              type: "input_image",
              image_url: imageDataUrl
            }
          ]
        }
      ],
      text: {
        format: responseFormat
      }
    })
  });

  if (!openAiResponse.ok) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "OPENAI_ERROR",
          message:
            openAiResponse.status === 401
              ? "OpenAI rejected the API key."
              : `OpenAI could not analyze the screenshot (status ${openAiResponse.status}).`
        }
      },
      { status: 502 }
    );
  }

  const payload = (await openAiResponse.json()) as { output_text?: string };
  if (!payload.output_text) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_OPENAI_RESPONSE",
          message: "OpenAI did not return a structured result."
        }
      },
      { status: 502 }
    );
  }

  let result: { matches: { effectTierId: string; reason: string }[]; caution: string };
  try {
    result = JSON.parse(payload.output_text) as { matches: { effectTierId: string; reason: string }[]; caution: string };
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PARSE_ERROR",
          message: "Could not parse the OpenAI result."
        }
      },
      { status: 502 }
    );
  }

  const matches = result.matches.filter((match) => candidateIds.has(match.effectTierId));

  return NextResponse.json({
    success: true,
    matches,
    caution: result.caution
  });
}
