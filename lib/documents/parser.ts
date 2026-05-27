import mammoth from "mammoth"
import pdf from "pdf-parse-fork"

export async function parseDocument(
  buffer: Buffer,
  fileType: "pdf" | "docx",
): Promise<string> {
  if (fileType === "pdf") {
    const data = await pdf(buffer)
    return data.text
  }

  if (fileType === "docx") {
    const { value } = await mammoth.extractRawText({ buffer })
    return value
  }

  throw new Error("Unsupported file type • Type de fichier non supporté")
}

export function detectFileType(mimeType: string): "pdf" | "docx" {
  if (mimeType === "application/pdf") return "pdf"
  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "docx"
  throw new Error("Invalid file type • Type de fichier invalide")
}