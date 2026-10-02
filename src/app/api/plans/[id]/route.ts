import { handle, service, checkOrigin, jsonBody } from "@/lib/http";
import { z } from "zod";
import { configSchema } from "@/lib/schemas";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  return handle(async () => service().get((await context.params).id));
}
export async function PATCH(request: Request, context: Context) {
  return handle(async () => {
    checkOrigin(request);
    const body = z
      .union([z.object({ config: configSchema }).strict(), configSchema])
      .parse(await jsonBody(request));
    return service().update(
      (await context.params).id,
      "config" in body ? body.config : body,
    );
  });
}
