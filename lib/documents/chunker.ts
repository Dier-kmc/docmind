// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"

// export interface Chunk {
//   content: string
//   chunkIndex: number
//   tokenCount: number
// }

// export async function chunkDocument(text: string): Promise<Chunk[]> {
//   const splitter = new RecursiveCharacterTextSplitter({
//     chunkSize: 1000,
//     chunkOverlap: 200,
//     separators: ["\n\n", "\n", ". ", " ", ""],
//   })

//   const docs = await splitter.createDocuments([text])

//   return docs.map((doc, index) => ({
//     content: doc.pageContent,
//     chunkIndex: index,
//     // Estimation simple : 1 token ≈ 4 caractères
//     tokenCount: Math.ceil(doc.pageContent.length / 4),
//   }))
// }

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"

interface DocumentChunk {
  content: string
  chunkIndex: number
  tokenCount: number
}

/**
 * Splits document text into manageable contextual fragments
 * Optimized for OpenAI text-embedding-3-small token bounds
 */
export async function chunkDocument(text: string): Promise<DocumentChunk[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 600,       // Targeted character window limit (~150 tokens)
    chunkOverlap: 60,     // Window overlap to preserve multi-sentence contexts
    separators: ["\n\n", "\n", ". ", "? ", "! ", " ", ""],
  })

  const output = await splitter.createDocuments([text])

  return output.map((doc, index) => {
    // Structural approximation of token density (1 token ≈ 4 characters)
    const tokenEstimation = Math.ceil(doc.pageContent.length / 4)

    return {
      content: doc.pageContent,
      chunkIndex: index,
      tokenCount: tokenEstimation,
    }
  })
}