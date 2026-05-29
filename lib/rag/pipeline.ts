import { retrieveRelevantChunks } from "./retriever"
import { buildContext, buildSystemPrompt } from "./context-builder"
import { supabaseAdmin } from "@/lib/supabase-server"
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
  )
}

export async function runRAGPipeline(
  input: PipelineInput,
): Promise<PipelineOutput> {
  const documentId = input.documentId || (input as any).docId
  const { query, userId } = input
  
  let sources: Source[] = []

  console.log(`\n🔍 [RAG PIPELINE] Processing query for Doc ID: ${documentId} | User: ${userId}`)

  // 1. STRATÉGIE MULTI-ROUTEUR
  if (isGlobalIntent(query)) {
    console.log("⚡ [RAG ROUTER] Global Intent Detected - Fetching full document mapping...")
    const db = supabaseAdmin()
    
    const { data: allChunks, error: dbError } = await db
      .from("document_chunks")
      .select("content, chunk_index, id, next_chunk_id, prev_chunk_id") // On prend les IDs pour uniformiser
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
        id: chunk.id,
        content: chunk.content,
        chunk_index: chunk.chunk_index,
        similarity: 1.0,
        next_chunk_id: chunk.next_chunk_id,
        prev_chunk_id: chunk.prev_chunk_id
      }))
    } else {
      console.warn("⚠️ [RAG ROUTER] Global fetch returned 0 chunks. Falling back to semantic search.")
    }
  }

  // 2. RECHERCHE SÉMANTIQUE LOCALISÉE + EXTENSION DE GRAPHE (JOUR 15)
  if (sources.length === 0) {
    console.log("🎯 [RAG ROUTER] Executing localized Semantic Vector Search via match_chunks RPC...")
    
    // Récupération des hits vectoriels initiaux (Top-K)
    const vectorHits = await retrieveRelevantChunks(query, {
      documentId,
      userId,
      topK: 4, // On baisse légèrement le Top-K initial à 4 car le graphe va naturellement doubler la densité
      threshold: 0.2,
    })

    if (vectorHits && vectorHits.length > 0) {
      console.log(`📊 [RAG FLOW] Vector search found ${vectorHits.length} seed chunks. Traversing graph links...`)
      
      // Collecte des identifiants des voisins directs (arcs du graphe)
      const neighborIdsToFetch = new Set<string>()
      vectorHits.forEach((hit: any) => {
        if (hit.prev_chunk_id) neighborIdsToFetch.add(hit.prev_chunk_id)
        if (hit.next_chunk_id) neighborIdsToFetch.add(hit.next_chunk_id)
      })

      // On retire de la liste à chercher les chunks qu'on a déjà trouvé via la recherche vectorielle
      vectorHits.forEach((hit: any) => {
        if (hit.id) neighborIdsToFetch.delete(hit.id)
      })

      let extendedChunks = [...vectorHits]

      if (neighborIdsToFetch.size > 0) {
        const db = supabaseAdmin()
        const { data: graphNeighbors, error: graphError } = await db
          .from("document_chunks")
          .select("id, content, chunk_index, next_chunk_id, prev_chunk_id")
          .in("id", Array.from(neighborIdsToFetch))

        if (!graphError && graphNeighbors) {
          console.log(`🔗 [GraphRAG] Graph Traversal Success: Fetched ${graphNeighbors.length} adjacent contextual nodes.`)
          
          // On ajoute les nœuds du graphe au contexte avec une similarité simulée ou nulle (pour l'UI)
          graphNeighbors.forEach((node) => {
            extendedChunks.push({
              id: node.id,
              content: node.content,
              chunk_index: node.chunk_index,
              similarity: 0.99, // Marqué virtuellement pour l'UI ou l'analyse
              prev_chunk_id: node.prev_chunk_id,
              next_chunk_id: node.next_chunk_id
            })
          })
        }
      }

      // Tri final par index de chunk pour restructurer la cohérence de lecture du document
      sources = extendedChunks.sort((a, b) => a.chunk_index - b.chunk_index)
    }
  }

  console.log(`📊 [RAG FLOW] Total Candidate Sources after graph hybridization: ${sources.length}`)

  // 3. Construit le contexte avec le budget tokens étendu
  const { contextText, sources: usedSources } = buildContext(sources, 8000)
  console.log(`📦 [RAG FLOW] Context built with ${usedSources.length} chunks fitting inside token boundaries.`)

  // 4. Construit le system prompt dynamique
  let systemPrompt = ""
  if (usedSources.length > 0) {
    systemPrompt = buildSystemPrompt(contextText)
  } else {
    console.log("⚠️ [RAG] Aucun chunk au-dessus du seuil. Forçage de l'ancrage document.")
systemPrompt = `You are DocMind AI, a world-class expert assistant. You are currently inside the document workspace.
Even if the semantic search did not find an exact match for this specific query, your absolute priority is to help the user based on the document's context and your general knowledge of the project.

Guidelines:
1. If the user refers to concepts previously discussed or related to the project workspace, reply to them naturally using the ongoing conversation history.
2. Never tell the user "I have no memory of this in our conversation" or "I couldn't find chunks". Instead, guide them by answering based on the context of the workspace or politely ask them to specify which part of the current document they are targeting.`
  }

  return {
    systemPrompt,
    sources: usedSources,
    hasContext: usedSources.length > 0,
  }
}