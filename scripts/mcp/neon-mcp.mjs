import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const apiKey = process.env.NEON_API_KEY;
const mode = process.env.MCP_MODE === "admin" ? "admin" : "safe";

if (!apiKey) {
  throw new Error("NEON_API_KEY is required.");
}

const server = new Server(
  { name: "local-neon-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

async function neon(path, init = {}) {
  const response = await fetch(`https://console.neon.tech/api/v2${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Neon API ${response.status}: ${text}`);
  }

  return response.json();
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = [
    {
      name: "listNeonProjects",
      description: "List Neon projects available to this API key.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "listNeonBranches",
      description: "List branches for a Neon project.",
      inputSchema: {
        type: "object",
        properties: { projectId: { type: "string" } },
        required: ["projectId"],
      },
    },
    {
      name: "runNeonSql",
      description: "Run read-only SQL against a Neon branch endpoint.",
      inputSchema: {
        type: "object",
        properties: {
          sql: { type: "string" },
          connectionString: { type: "string" },
        },
        required: ["sql", "connectionString"],
      },
    },
  ];

  if (mode === "admin") {
    tools.push({
      name: "createNeonBranch",
      description: "Create a branch in a Neon project (admin mode only).",
      inputSchema: {
        type: "object",
        properties: {
          projectId: { type: "string" },
          branchName: { type: "string" },
          parentBranchId: { type: "string" },
        },
        required: ["projectId", "branchName"],
      },
    });
  }

  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const name = request.params.name;
  const args = request.params.arguments ?? {};

  if (name === "listNeonProjects") {
    const data = await neon("/projects");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  if (name === "listNeonBranches") {
    const input = z.object({ projectId: z.string().min(1) }).parse(args);
    const data = await neon(`/projects/${input.projectId}/branches`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  if (name === "runNeonSql") {
    const input = z
      .object({
        sql: z.string().min(1),
        connectionString: z.string().url(),
      })
      .parse(args);

    const normalized = input.sql.trim().toLowerCase();
    const isReadOnly =
      normalized.startsWith("select") ||
      normalized.startsWith("with") ||
      normalized.startsWith("show") ||
      normalized.startsWith("explain");

    if (!isReadOnly && mode !== "admin") {
      throw new Error("Safe mode only allows read-only SQL statements.");
    }

    const response = await fetch(input.connectionString, {
      method: "POST",
      headers: {
        "Content-Type": "application/sql",
      },
      body: input.sql,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`SQL endpoint ${response.status}: ${text}`);
    }

    const text = await response.text();
    return { content: [{ type: "text", text }] };
  }

  if (name === "createNeonBranch") {
    if (mode !== "admin") {
      throw new Error("createNeonBranch is only available in admin mode.");
    }

    const input = z
      .object({
        projectId: z.string().min(1),
        branchName: z.string().min(1),
        parentBranchId: z.string().optional(),
      })
      .parse(args);

    const payload = {
      branch: {
        name: input.branchName,
        ...(input.parentBranchId ? { parent_id: input.parentBranchId } : {}),
      },
    };
    const data = await neon(`/projects/${input.projectId}/branches`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);