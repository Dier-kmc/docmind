import { Source } from "@/types"

interface ContextResult {
  contextText: string
  sources: Source[]
  totalTokensUsed: number
}

/**
 * Estime le nombre de tokens d'un texte basé sur la distribution de caractères
 */
export function estimateTokens(text: string): number {
  if (!text) return 0
  return Math.ceil(text.length / 3.5)
}

/**
 * Accumule les morceaux de texte jusqu'à atteindre la limite stricte du budget de tokens
 */
export function buildContext(sources: Source[], tokenBudget: number): ContextResult {
  let contextText = ""
  const usedSources: Source[] = []
  let currentTokens = 0

  // On trie les sources par pertinence décroissante (similarité)
  const sortedSources = [...sources].sort((a, b) => b.similarity - a.similarity)

  for (const source of sortedSources) {
    const formattedChunk = `[Source Page/Index: ${source.chunk_index}]: ${source.content}\n\n`
    const chunkTokens = estimateTokens(formattedChunk)

    // 🎯 Sécurité Budget : Si le chunk dépasse le budget restant, on arrête l'accumulation
    if (currentTokens + chunkTokens > tokenBudget) {
      break
    }

    contextText += formattedChunk
    currentTokens += chunkTokens
    usedSources.push(source)
  }

  return {
    contextText,
    sources: usedSources,
    totalTokensUsed: currentTokens,
  }
}

export function buildSystemPrompt(contextText: string): string {
  return `You are DocMind AI, an advanced technical software architecture consultant and document analyzer.
Your task is to answer the user's question using ONLY the verified source fragments provided below.

CRITICAL RULES:
1. If the context is empty or does not contain the answer, reply exactly with: "Les informations fournies ne permettent pas de répondre à cette question."
2. Do not invent, hallucinate, or extrapolate facts outside the context.
3. ANTI-HALLUCINATION DE PAGINATION : Ne cite JAMAIS un numéro de page (ex: "à la page X") ou de section à moins que ce numéro de page précis ne soit explicitement écrit à l'intérieur du texte d'un fragment vérifié ci-dessous. Si l'information est présente mais qu'aucun numéro de page n'est écrit dans le fragment, indique simplement que l'information provient du document sans inventer de localisation physique.
4. Keep your answers factual, structured, and professional.
5. Always respond in the same language as the user's question.
6. Improve if necessary your answer by synthesizing information from multiple sources when relevant, but never add information not present in the sources.

[VERIFIED CONTEXT]
${contextText || "No context available for this query."}`
}


// import { Source } from "@/types"

// const DEFAULT_CONTEXT_TOKENS = 3000 // Budget par défaut (~12 000 caractères)
// const CHARS_PER_TOKEN        = 4

// export interface BuiltContext {
//   contextText: string
//   sources: Source[]
//   totalTokens: number
// }

// /**
//  * Assemble les morceaux de documents en respectant un budget de tokens dynamique.
//  * @param sources Liste des chunks extraits
//  * @param tokenBudget Budget optionnel (ex: 8000 pour les résumés globaux)
//  */
// export function buildContext(
//   sources: Source[],
//   maxTokens: number = 3000  // ✅ paramètre ajouté
// ): BuiltContext {
//   if (sources.length === 0) {
//     return { contextText: "", sources: [], totalTokens: 0 }
//   }

//   const sorted = [...sources].sort((a, b) => b.similarity - a.similarity)

//   let contextText  = ""
//   let totalTokens  = 0
//   const usedSources: Source[] = []

//   for (const source of sorted) {
//     const estimatedTokens = Math.ceil(source.content.length / CHARS_PER_TOKEN)
//     if (totalTokens + estimatedTokens > maxTokens) break  // ✅ utilise maxTokens
//     contextText  += `\n\n---\n${source.content}`
//     totalTokens  += estimatedTokens
//     usedSources.push(source)
//   }

//   return { contextText: contextText.trim(), sources: usedSources, totalTokens }
// }

// export function buildSystemPrompt(contextText: string): string {
//   if (!contextText) {
//     return `You are DocMind, an AI assistant. 
// The user asked a question but no relevant content was found in the document.
// Respond in the same language as the user's question.
// Tell them clearly that the answer was not found in the document.`
//   }

//   return `You are DocMind, an AI assistant that answers questions based ONLY on the provided document context.

// RULES:
// - Answer based strictly on the context below
// - If the answer is not in the context, say so clearly
// - Be concise and precise
// - Respond in the same language as the user's question
// - Never make up information

// DOCUMENT CONTEXT:
// ${contextText}`
// }