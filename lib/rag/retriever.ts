import { supabaseAdmin } from "@/lib/supabase-server"
import { generateEmbedding } from "./embeddings"
import { Source } from "@/types"

interface RetrieveOptions {
  documentId: string
  userId: string
  topK?: number
  threshold?: number
}

/**
 * Nettoie la requête utilisateur pour maximiser la qualité du matching vectoriel
 */
function cleanQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(/[\n\r]/g, " ")
    .replace(/\s+/g, " ")
}

export async function retrieveRelevantChunks(
  rawQuery: string,
  options: RetrieveOptions
): Promise<Source[]> {
  const { documentId, userId, topK = 4, threshold = 0.25 } = options
  const db = supabaseAdmin()

  // 1. Nettoyage de la requête pour alignement sémantique
  const cleanedQuery = cleanQuery(rawQuery)

  // 2. Génération du vecteur via ton fichier d'embeddings actuel (HfInference)
  const queryVector = await generateEmbedding(cleanedQuery)

  // 3. Appel RPC Supabase avec le filtre strict d'isolation utilisateur (Feature 21)
  const { data: matchedChunks, error } = await db.rpc("match_chunks", {
    query_embedding: queryVector,
    match_document_id: documentId,
    match_user_id: userId,
    match_count: topK,
    similarity_threshold: threshold
  })

  if (error) {
    console.error("Supabase RPC match_chunks failed:", error)
    return []
  }

  if (!matchedChunks || matchedChunks.length === 0) {
    return []
  }

  // 4. Mapping propre vers notre type Source de l'application
  return matchedChunks.map((chunk: any) => ({
    content: chunk.content,
    similarity: chunk.similarity,
    chunk_index: chunk.chunk_index
  }))
}