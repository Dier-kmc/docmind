import { retrieveRelevantChunks } from "./retriever"
import { buildContext, buildSystemPrompt } from "./context-builder"
import { supabaseAdmin } from "@/lib/supabase"
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
  // 🎯 Sécurité de secours au cas où l'objet input contiendrait 'docId' au lieu de 'documentId'
  const documentId = input.documentId || (input as any).docId
  const { query, userId } = input
  // const { contextText, sources: usedSources } = buildContext(sources, 8000)
  
  let sources: Source[] = []

  console.log(`\n🔍 [RAG PIPELINE] Processing query for Doc ID: ${documentId} | User: ${userId}`)

  // 1. STRATÉGIE MULTI-ROUTEUR
  if (isGlobalIntent(query)) {
    console.log("⚡ [RAG ROUTER] Global Intent Detected - Fetching full document mapping...");
    const db = supabaseAdmin()
    
    const { data: allChunks, error: dbError } = await db
      .from("document_chunks")
      .select("content, chunk_index")
      // 💡 NOTE : Si ton bug persiste, vérifie dans Supabase si ta colonne s'appelle 'document_id' ou 'doc_id'
      .eq("document_id", documentId) 
      .eq("user_id", userId)
      .order("chunk_index", { ascending: true })
      .limit(15)

    if (dbError) {
      console.error("❌ [RAG DB ERROR] Direct fetch failed:", dbError)
    }

    if (allChunks && allChunks.length > 0) {
      console.log(`✅ [RAG ROUTER] Successfully fetched ${allChunks.length} sequential chunks.`)
      sources = allChunks.map(chunk => ({
        content: chunk.content,
        chunk_index: chunk.chunk_index,
        similarity: 1.0 
      }))
    } else {
      console.warn("⚠️ [RAG ROUTER] Global fetch returned 0 chunks. Falling back to semantic search.")
    }
  }

  // Si l'intention n'est pas globale OU si la méthode globale a échoué (sécurité)
  if (sources.length === 0) {
    console.log("🎯 [RAG ROUTER] Executing localized Semantic Vector Search via match_chunks RPC...")
    sources = await retrieveRelevantChunks(query, {
      documentId,
      userId,
      topK: 6,
      threshold: 0.2, // Garde cette tolérance basse à 0.2 pour éviter les faux négatifs en multi-doc
    })
  }

  console.log(`📊 [RAG FLOW] Total Candidate Sources after filtering: ${sources.length}`)

  // 2. Construit le contexte avec le budget tokens étendu
  const { contextText, sources: usedSources } = buildContext(sources, 8000)
  console.log(`📦 [RAG FLOW] Context built with ${usedSources.length} chunks fitting inside token boundaries.`)

  // 3. Construit le system prompt
  let systemPrompt = ""
  if (usedSources.length > 0) {
    // Prompt classique avec contexte document
    systemPrompt = buildSystemPrompt(contextText)
  } else {
    // 🎯 FALLBACK MEMORY (Jour 13) : Permet de continuer la discussion sur l'historique si aucun chunk ne sort
    systemPrompt = `You are DocMind AI. No specific new fragments from the document matched this last query. 
Use the ongoing conversation history below to reply to the user naturally. If they ask about facts inside the document that you don't have in history, politely remind them to be more specific.`
  }

  return {
    systemPrompt,
    sources: usedSources,
    hasContext: usedSources.length > 0,
  }
}