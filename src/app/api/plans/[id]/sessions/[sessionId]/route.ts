import { handle, service, checkOrigin, jsonBody } from "@/lib/http";
import { z } from "zod";
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; sessionId: string }> },
) {
  return handle(async () => {
    checkOrigin(request);
    const body = z
      .object({ status: z.enum(["not_started", "in_progress", "completed"]) })
      .strict()
      .parse(await jsonBody(request));
    const { id, sessionId } = await context.params;
    return service().setStatus(id, sessionId, body.status);
  });
}
