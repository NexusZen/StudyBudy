import { handle, service, checkOrigin, boundedBytes } from "@/lib/http";
import { extractDocument, MAX_FILE_SIZE } from "@/lib/documents";
import { validateConfig } from "@/lib/schemas";
import { AppError } from "@/lib/errors";
export const runtime = "nodejs";
export async function GET() {
  return handle(() => service().list());
}
export async function POST(request: Request) {
  return handle(async () => {
    checkOrigin(request);
    const bytes = await boundedBytes(request, MAX_FILE_SIZE + 64000);
    let form: FormData;
    try {
      form = await new Response(bytes, {
        headers: { "content-type": request.headers.get("content-type") || "" },
      }).formData();
    } catch {
      throw new AppError(
        "INVALID_FORM",
        "Submit a file and study settings using multipart form data.",
      );
    }
    const file = form.get("file"),
      raw = form.get("config");
    if (!(file instanceof File) || typeof raw !== "string")
      throw new AppError(
        "INVALID_FORM",
        "Study material and settings are required.",
      );
    const config = validateConfig(JSON.parse(raw));
    const material = await extractDocument(file);
    return service().create(config, material);
  }, 201);
}
