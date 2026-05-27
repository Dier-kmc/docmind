import { supabaseAdmin } from "@/lib/supabase";

export async function sanitizeFileName(fileName: string): Promise<string> {
  // Extract extension
  const extension = fileName.split(".").pop();
  // Extract name without extension
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));

  const cleanName = nameWithoutExt
    .normalize("NFD") // Separate letters from accents
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-zA-Z0-9-_]/g, "_") // Replace any special character or space with an underscore
    .replace(/_+/g, "_"); // Collapse multiple consecutive underscores

  return `${cleanName}.${extension}`;
}

export async function uploadFileToStorage(
  file: Buffer,
  fileName: string,
  userId: string,
  fileType: "pdf" | "docx",
): Promise<string> {
  const client = supabaseAdmin();

  const cleanName = await sanitizeFileName(fileName);

  const path = `${userId}/${Date.now()}-${cleanName}`;

  const { error } = await client.storage.from("documents").upload(path, file, {
    contentType:
      fileType === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    upsert: true,
  });

  if (error) throw new Error(error.message);

  const { data } = client.storage.from("documents").getPublicUrl(path);
  return data.publicUrl;
}
