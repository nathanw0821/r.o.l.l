import { NextResponse } from "next/server";
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
  candidates: z.array(candidateSchema).min(1).max(120)
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

  const { apiKey, imageDataUrl, candidates } = parsed.data;
  const candidateIds = new Set(candidates.map((candidate) => candidate.effectTierId));

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
                "You help manually review Fallout 76 legendary screenshot uploads. Only return candidate effectTierIds that are clearly supported by the screenshot. If you are unsure, leave the effect out. Never invent ids outside the candidate list."
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
    const details = await openAiResponse.text();
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "OPENAI_ERROR",
          message: "OpenAI could not analyze the screenshot.",
          details
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
