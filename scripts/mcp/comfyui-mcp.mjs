import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const baseUrl = (process.env.COMFYUI_BASE_URL || "http://127.0.0.1:8188").replace(/\/+$/, "");
const apiKey = process.env.COMFYUI_API_KEY || "";

const server = new Server(
  { name: "local-comfyui-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

async function comfy(path, init = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    ...(init.headers ?? {}),
  };

  const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ComfyUI ${response.status}: ${text}`);
  }
  return response.json();
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "listWorkflows",
      description: "List available ComfyUI workflow templates in workflows/ folder.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "queuePrompt",
      description: "Queue a ComfyUI workflow prompt JSON payload.",
      inputSchema: {
        type: "object",
        properties: {
          prompt: { type: "object" },
          clientId: { type: "string" },
        },
        required: ["prompt"],
      },
    },
    {
      name: "getHistory",
      description: "Get ComfyUI prompt history for a given prompt ID.",
      inputSchema: {
        type: "object",
        properties: { promptId: { type: "string" } },
        required: ["promptId"],
      },
    },
    {
      name: "getImage",
      description: "Get view URL for an image in ComfyUI output folder.",
      inputSchema: {
        type: "object",
        properties: {
          filename: { type: "string" },
          subfolder: { type: "string" },
          type: { type: "string" },
        },
        required: ["filename"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const name = request.params.name;
  const args = request.params.arguments ?? {};

  if (name === "listWorkflows") {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const workflowsDir = path.resolve(process.cwd(), "workflows");

    let entries = [];
    try {
      entries = await fs.readdir(workflowsDir, { withFileTypes: true });
    } catch {
      entries = [];
    }

    const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".json")).map((entry) => entry.name);
    return { content: [{ type: "text", text: JSON.stringify({ workflowsDir, files }, null, 2) }] };
  }

  if (name === "queuePrompt") {
    const input = z
      .object({
        prompt: z.record(z.any()),
        clientId: z.string().optional(),
      })
      .parse(args);
    const data = await comfy("/prompt", {
      method: "POST",
      body: JSON.stringify({
        prompt: input.prompt,
        ...(input.clientId ? { client_id: input.clientId } : {}),
      }),
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  if (name === "getHistory") {
    const input = z.object({ promptId: z.string().min(1) }).parse(args);
    const data = await comfy(`/history/${encodeURIComponent(input.promptId)}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  if (name === "getImage") {
    const input = z
      .object({
        filename: z.string().min(1),
        subfolder: z.string().optional().default(""),
        type: z.string().optional().default("output"),
      })
      .parse(args);
    const query = new URLSearchParams({
      filename: input.filename,
      subfolder: input.subfolder,
      type: input.type,
    });
    const url = `${baseUrl}/view?${query.toString()}`;
    return { content: [{ type: "text", text: url }] };
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
