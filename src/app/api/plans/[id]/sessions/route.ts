import { handle, service, checkOrigin, jsonBody } from "@/lib/http";
import { z } from "zod";
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    checkOrigin(request);
    const body = z
      .object({
        sessionId: z.string().min(1).max(240),
        status: z.enum(["not_started", "in_progress", "completed"]),
      })
      .strict()
      .parse(await jsonBody(request));
    return service().setStatus(
      (await context.params).id,
      body.sessionId,
      body.status,
    );
  });
}
