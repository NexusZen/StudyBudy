import { z } from "zod";
import { AppError } from "./errors";
import {
  FakeStudyMaterialAnalyzer,
  GeminiStudyMaterialAnalyzer,
} from "./analyzer";
import { SqliteRepository } from "./repository";
import { PlanService } from "./service";
export function provider() {
  const value = process.env.AI_PROVIDER || "fake";
  if (value !== "fake" && value !== "gemini")
    throw new AppError(
      "INVALID_PROVIDER",
      "AI_PROVIDER must be fake or gemini.",
      503,
    );
  return value;
}
const globalState = globalThis as typeof globalThis & {
  studyBudyService?: PlanService;
};
export function service() {
  if (!globalState.studyBudyService) {
    const p = provider();
    globalState.studyBudyService = new PlanService(
      new SqliteRepository(),
      p === "fake"
        ? new FakeStudyMaterialAnalyzer()
        : new GeminiStudyMaterialAnalyzer(),
      p,
    );
  }
  return globalState.studyBudyService;
}
export async function handle(fn: () => Promise<unknown>, status = 200) {
  try {
    return Response.json(await fn(), { status });
  } catch (error) {
    if (error instanceof AppError)
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    if (error instanceof z.ZodError || error instanceof SyntaxError)
      return Response.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: "The request contains invalid data.",
          },
        },
        { status: 400 },
      );
    return Response.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message:
            "Could not complete the operation. Check local storage and retry.",
        },
      },
      { status: 500 },
    );
  }
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  const host = request.headers.get("host") ?? url.host;
  let matches = !origin;
  if (origin) {
    try {
      const source = new URL(origin);
      matches =
        source.host === host &&
        source.protocol === url.protocol &&
        source.origin === origin;
    } catch {
      matches = false;
    }
  }
  if (!matches)
    throw new AppError(
      "FORBIDDEN_ORIGIN",
      "Requests must originate from this app.",
      403,
    );
  if (request.headers.get("sec-fetch-site") === "cross-site")
    throw new AppError(
      "FORBIDDEN_ORIGIN",
      "Requests must originate from this app.",
      403,
    );
}
export async function boundedBytes(request: Request, limit: number) {
  const length = request.headers.get("content-length");
  if (length && Number(length) > limit)
    throw new AppError(
      "REQUEST_TOO_LARGE",
      "Request body exceeds the allowed size.",
      413,
    );
  const reader = request.body?.getReader();
  if (!reader) throw new AppError("EMPTY_REQUEST", "Request body is empty.");
  let count = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    count += value.byteLength;
    if (count > limit) {
      await reader.cancel();
      throw new AppError(
        "REQUEST_TOO_LARGE",
        "Request body exceeds the allowed size.",
        413,
      );
    }
    chunks.push(value);
  }
  const data = new Uint8Array(count);
  let offset = 0;
  for (const chunk of chunks) {
    data.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return data;
}
export async function jsonBody(request: Request) {
  return JSON.parse(
    new TextDecoder().decode(await boundedBytes(request, 64000)),
  ) as unknown;
}
