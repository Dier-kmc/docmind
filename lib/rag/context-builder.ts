import { Source } from "@/types"

const DEFAULT_CONTEXT_TOKENS = 3000 // Budget par défaut (~12 000 caractères)
const CHARS_PER_TOKEN        = 4

export interface BuiltContext {
  contextText: string
  sources: Source[]
  totalTokens: number
}

/**
 * Assemble les morceaux de documents en respectant un budget de tokens dynamique.
 * @param sources Liste des chunks extraits
 * @param tokenBudget Budget optionnel (ex: 8000 pour les résumés globaux)
 */
export function buildContext(sources: Source[], tokenBudget: number = DEFAULT_CONTEXT_TOKENS): BuiltContext {
  if (sources.length === 0) {
    return { contextText: "", sources: [], totalTokens: 0 }
  }

  // Trie par similarité décroissante
  const sorted = [...sources].sort((a, b) => b.similarity - a.similarity)

  let contextText  = ""
  let totalTokens  = 0
  const usedSources: Source[] = []

  for (const source of sorted) {
    const estimatedTokens = Math.ceil(source.content.length / CHARS_PER_TOKEN)

    // Respecte le budget de tokens configuré dynamiquement
    if (totalTokens + estimatedTokens > tokenBudget) break

    contextText  += `\n\n---\n${source.content}`
    totalTokens  += estimatedTokens
    usedSources.push(source)
  }

  return { contextText: contextText.trim(), sources: usedSources, totalTokens }
}

export function buildSystemPrompt(contextText: string): string {
  if (!contextText) {
    return `You are DocMind, an AI assistant. 
The user asked a question but no relevant content was found in the document.
Respond in the same language as the user's question.
Tell them clearly that the answer was not found in the document.`
  }

  return `You are DocMind, an AI assistant that answers questions based ONLY on the provided document context.

RULES:
- Answer based strictly on the context below
- If the answer is not in the context, say so clearly
- Be concise and precise
- Respond in the same language as the user's question
- Never make up information

DOCUMENT CONTEXT:
${contextText}`
}