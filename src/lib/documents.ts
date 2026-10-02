import { AppError } from "./errors";
interface Upload {
  name: string;
  type: string;
  size: number;
  arrayBuffer(): Promise<ArrayBuffer>;
}
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export async function extractDocument(file: Upload) {
  if (
    !file.name ||
    file.name.length > 160 ||
    /[\\/\x00-\x1f]/.test(file.name) ||
    file.name.startsWith(".")
  )
    throw new AppError(
      "INVALID_FILENAME",
      "Use a simple filename without paths.",
    );
  const ext = file.name.toLowerCase().split(".").pop();
  if (
    (ext !== "txt" && ext !== "pdf") ||
    (file.type &&
      file.type !== (ext === "pdf" ? "application/pdf" : "text/plain"))
  )
    throw new AppError(
      "UNSUPPORTED_FILE",
      "Upload a text-based PDF or UTF-8 TXT file.",
      415,
    );
  if (file.size > MAX_FILE_SIZE)
    throw new AppError(
      "FILE_TOO_LARGE",
      "Upload limit is 5 MiB. Split the material into smaller sections.",
      413,
    );
  if (file.size <= 0)
    throw new AppError("EMPTY_FILE", "The uploaded file is empty.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.byteLength > MAX_FILE_SIZE)
    throw new AppError("FILE_TOO_LARGE", "Upload limit is 5 MiB.", 413);
  let text: string;
  try {
    if (ext === "txt") {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      if (text.includes("\0")) throw new Error("binary text");
    } else {
      if (new TextDecoder().decode(bytes.subarray(0, 5)) !== "%PDF-")
        throw new Error("bad signature");
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: bytes });
      try {
        const parsed = await parser.getText();
        text = parsed.pages.map((page) => page.text).join("\n");
      } finally {
        await parser.destroy();
      }
    }
  } catch {
    throw new AppError(
      "EXTRACTION_FAILED",
      "Could not read this document. Use an unencrypted text-based PDF or UTF-8 TXT; scanned PDFs require OCR.",
    );
  }
  text = text.trim();
  if (!text || !/[\p{L}\p{N}]/u.test(text))
    throw new AppError(
      "NO_READABLE_TEXT",
      "No readable study text found. Scanned PDFs require OCR.",
    );
  if (text.length > 100000)
    throw new AppError(
      "TEXT_TOO_LARGE",
      "Material exceeds 100,000 extracted characters. Upload smaller sections.",
      413,
    );
  return { text, fileName: file.name };
}
