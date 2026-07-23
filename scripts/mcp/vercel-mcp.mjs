import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const token = process.env.VERCEL_TOKEN;
const teamId = process.env.VERCEL_TEAM_ID || "";
const mode = process.env.MCP_MODE === "admin" ? "admin" : "safe";

if (!token) {
  throw new Error("VERCEL_TOKEN is required.");
}

const server = new Server(
  { name: "local-vercel-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

function qs(path) {
  if (!teamId) return path;
  const join = path.includes("?") ? "&" : "?";
  return `${path}${join}teamId=${encodeURIComponent(teamId)}`;
}

async function vercel(path, init = {}) {
  const response = await fetch(`https://api.vercel.com${qs(path)}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Vercel API ${response.status}: ${text}`);
  }

  return response.json();
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = [
    {
      name: "listVercelProjects",
      description: "List Vercel projects for the current account/team.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "listVercelDeployments",
      description: "List Vercel deployments for a project.",
      inputSchema: {
        type: "object",
        properties: { projectId: { type: "string" }, limit: { type: "number" } },
        required: ["projectId"],
      },
    },
  ];

  if (mode === "admin") {
    tools.push({
      name: "triggerDeployHook",
      description: "Trigger a deploy hook URL (admin mode only).",
      inputSchema: {
        type: "object",
        properties: {
          deployHookUrl: { type: "string" },
        },
        required: ["deployHookUrl"],
      },
    });
  }

  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const name = request.params.name;
  const args = request.params.arguments ?? {};

  if (name === "listVercelProjects") {
    const data = await vercel("/v9/projects");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  if (name === "listVercelDeployments") {
    const input = z
      .object({ projectId: z.string().min(1), limit: z.number().int().min(1).max(100).optional() })
      .parse(args);
    const limit = input.limit ?? 20;
    const data = await vercel(`/v6/deployments?projectId=${encodeURIComponent(input.projectId)}&limit=${limit}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  if (name === "triggerDeployHook") {
    if (mode !== "admin") {
      throw new Error("triggerDeployHook is only available in admin mode.");
    }
    const input = z.object({ deployHookUrl: z.string().url() }).parse(args);
    const response = await fetch(input.deployHookUrl, { method: "POST" });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Deploy hook ${response.status}: ${text}`);
    }
    return { content: [{ type: "text", text: text || "Deploy hook triggered." }] };
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
