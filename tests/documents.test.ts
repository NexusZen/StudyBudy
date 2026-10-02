import { describe, expect, it } from "vitest";
import { extractDocument } from "../src/lib/documents.js";

const upload = (name: string, type: string, text: string) => {
  const bytes = new TextEncoder().encode(text);
  return {
    name,
    type,
    size: bytes.byteLength,
    arrayBuffer: async () => bytes.buffer,
  };
};
function textPdf() {
  const stream =
    "BT /F1 18 Tf 40 150 Td (Photosynthesis and cellular respiration) Tj ET";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 200] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];
  let body = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(body));
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(body);
  body += `xref\n0 6\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("")}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  const bytes = new TextEncoder().encode(body);
  return {
    name: "biology.pdf",
    type: "application/pdf",
    size: bytes.byteLength,
    arrayBuffer: async () => bytes.buffer,
  };
}
describe("transient document processing", () => {
  it("TEST-019 REQ-003,007 parses UTF-8 TXT and preserves safe provenance", async () => {
    expect(
      await extractDocument(
        upload("biology.txt", "text/plain", "Cells and photosynthesis বাংলা"),
      ),
    ).toEqual({
      text: "Cells and photosynthesis বাংলা",
      fileName: "biology.txt",
    });
  });
  it("TEST-031 REQ-003,007 extracts actual text from a valid PDF fixture", async () => {
    const result = await extractDocument(textPdf());
    expect(result.fileName).toBe("biology.pdf");
    expect(result.text).toContain("Photosynthesis and cellular respiration");
  }, 20000);
  it("TEST-020 REQ-003,018,020,021 rejects unsupported, empty, oversized and malicious files", async () => {
    for (const file of [
      upload("data.exe", "application/octet-stream", "bad"),
      upload("empty.txt", "text/plain", ""),
      upload("white.txt", "text/plain", "   \n"),
      upload("../secret.txt", "text/plain", "secret"),
      upload("..\\secret.txt", "text/plain", "secret"),
      upload("broken.pdf", "application/pdf", "not a PDF"),
    ]) {
      await expect(extractDocument(file)).rejects.toThrow();
    }
    let read = false;
    await expect(
      extractDocument({
        name: "huge.txt",
        type: "text/plain",
        size: 5 * 1024 * 1024 + 1,
        arrayBuffer: async () => {
          read = true;
          return new ArrayBuffer(0);
        },
      }),
    ).rejects.toThrow();
    expect(read).toBe(false);
  });
});
