import { supabaseAdmin } from "@/lib/supabase-server"

export interface DocumentRecord {
  id: string
  user_id: string
  name: string
  file_url: string
  file_type: "pdf" | "docx"
  chunk_count: number
  created_at: string
}

/**
 * Fetches a single document by its ID, isolated by user_id for strict RLS data security.
 */
export async function getDocument(
  docId: string, 
  userId: string | undefined
): Promise<DocumentRecord | null> {
  if (!userId) return null

  const db = supabaseAdmin()

  const { data, error } = await db
    .from("documents")
    .select("*")
    .eq("id", docId)
    .eq("user_id", userId) // Enforces data isolation
    .single()

  if (error) {
    console.error(`Error loading document metadata ID ${docId}:`, error.message)
    return null
  }

  return data as DocumentRecord
}