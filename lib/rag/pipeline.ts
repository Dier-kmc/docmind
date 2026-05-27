import { retrieveRelevantChunks } from "./retriever"
import { buildContext, buildSystemPrompt } from "./context-builder"
import { supabaseAdmin } from "@/lib/supabase" // Import du client admin
import { Source } from "@/types"

interface PipelineInput {
  query: string
  documentId: string
  userId: string
  conversationHistory: { role: string; content: string }[]
}

interface PipelineOutput {
  systemPrompt: string
  sources: Source[]
  hasContext: boolean
}

/**
 * Détecte si l'utilisateur demande une action globale sur tout le document
 */
function isGlobalIntent(query: string): boolean {
  const lowerQuery = query.toLowerCase()
  return (
    lowerQuery.includes("summarize") || 
    lowerQuery.includes("résume") || 
    lowerQuery.includes("synthèse") ||
    lowerQuery.includes("synthétise") ||
    lowerQuery.includes("global")
  );
}

export async function runRAGPipeline(
  input: PipelineInput,
): Promise<PipelineOutput> {
  const { query, documentId, userId } = input
  let sources: Source[] = []

  // 1. STRATÉGIE MULTI-ROUTEUR : Détection de l'intention globale
  if (isGlobalIntent(query)) {
    const db = supabaseAdmin()
    
    // Au lieu de faire une recherche vectorielle restreinte, on extrait TOUS les chunks du document
    const { data: allChunks } = await db
      .from("document_chunks")
      .select("content, chunk_index")
      .eq("document_id", documentId)
      .eq("user_id", userId)
      .order("chunk_index", { ascending: true })
      .limit(15) // On prend une large couverture du document (ajustable selon tes besoins)

    if (allChunks) {
      sources = allChunks.map(chunk => ({
        content: chunk.content,
        chunk_index: chunk.chunk_index,
        similarity: 1.0 // Valeur arbitraire symbolisant une lecture intégrale
      }))
    }
  } else {
    // Recherche sémantique classique par similarité pour les questions précises
    sources = await retrieveRelevantChunks(query, {
      documentId,
      userId,
      topK: 6, // Augmenté légèrement pour donner plus de matière à Gemini
      threshold: 0.2, // Légèrement abaissé pour être plus tolérant
    })
  }

  // 2. Construit le contexte avec budget tokens étendu pour Gemini (ex: 8000 tokens)
  const { contextText, sources: usedSources } = buildContext(sources, 8000)

  // 3. Construit le system prompt
  const systemPrompt = buildSystemPrompt(contextText)

  return {
    systemPrompt,
    sources: usedSources,
    hasContext: usedSources.length > 0,
  }
}