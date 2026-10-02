import { handle, provider } from "@/lib/http";
export async function GET() {
  return handle(async () => ({ provider: provider() }));
}
