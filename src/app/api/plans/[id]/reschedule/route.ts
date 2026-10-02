import { handle, service, checkOrigin, jsonBody } from "@/lib/http";
import { z } from "zod";
import { dateSchema, configSchema } from "@/lib/schemas";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    checkOrigin(request);
    const body = z
      .object({ fromDate: dateSchema, config: configSchema.optional() })
      .strict()
      .parse(await jsonBody(request));
    return service().reschedule(
      (await context.params).id,
      body.fromDate,
      body.config,
    );
  });
}
