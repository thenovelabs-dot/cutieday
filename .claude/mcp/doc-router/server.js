#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "../../..");

const server = new Server(
  { name: "doc-router", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "get_relevant_docs",
    description: "앱인토스 & TDS 문서에서 현재 태스크에 관련된 섹션만 추출합니다. 앱인토스나 TDS 관련 작업 시 전체 문서 대신 이 툴을 사용하세요.",
    inputSchema: {
      type: "object",
      properties: {
        task: {
          type: "string",
          description: "구현하려는 기능이나 작업 내용을 자세히 설명"
        }
      },
      required: ["task"]
    }
  }]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "get_relevant_docs") {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  const { task } = request.params.arguments;

  const appsDoc = readFileSync(join(PROJECT_ROOT, "docs/skills/apps-in-toss.md"), "utf-8");
  const tdsDoc = readFileSync(join(PROJECT_ROOT, "docs/skills/tds-mobile.md"), "utf-8");

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  process.stderr.write(`[doc-router] 태스크: ${task}\n`);
  process.stderr.write(`[doc-router] GPT 호출 중... (model: ${model})\n`);

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `당신은 문서 라우터입니다. 개발 태스크에 필요한 문서 섹션만 추출해서 반환하세요.
관련 없는 섹션은 완전히 생략하고, 관련 있는 내용만 원문 그대로 복사하세요.
섹션 제목에는 어느 문서(apps-in-toss / tds-mobile)에서 왔는지 명시하세요.`
      },
      {
        role: "user",
        content: `태스크: ${task}

=== apps-in-toss.md ===
${appsDoc}

=== tds-mobile.md ===
${tdsDoc}

이 태스크를 구현하는 데 필요한 섹션만 추출해주세요.`
      }
    ],
    max_tokens: 8000
  });

  const usage = response.usage;
  process.stderr.write(`[doc-router] 응답 완료 — 토큰: ${usage.prompt_tokens} prompt / ${usage.completion_tokens} completion\n`);

  return {
    content: [{
      type: "text",
      text: response.choices[0].message.content
    }]
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
