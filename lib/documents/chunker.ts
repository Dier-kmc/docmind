// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"

// interface DocumentChunk {
//   content: string
//   chunkIndex: number
//   tokenCount: number
// }

// /**
//  * Splits document text into manageable contextual fragments
//  * Optimized for OpenAI text-embedding-3-small token bounds
//  */
// export async function chunkDocument(text: string): Promise<DocumentChunk[]> {
//   const splitter = new RecursiveCharacterTextSplitter({
//     chunkSize: 600,       // Targeted character window limit (~150 tokens)
//     chunkOverlap: 60,     // Window overlap to preserve multi-sentence contexts
//     separators: ["\n\n", "\n", ". ", "? ", "! ", " ", ""],
//   })

//   const output = await splitter.createDocuments([text])

//   return output.map((doc, index) => {
//     // Structural approximation of token density (1 token ≈ 4 characters)
//     const tokenEstimation = Math.ceil(doc.pageContent.length / 4)

//     return {
//       content: doc.pageContent,
//       chunkIndex: index,
//       tokenCount: tokenEstimation,
//     }
//   })
// }

import { MarkdownTextSplitter } from "@langchain/textsplitters"

interface DocumentChunk {
  content: string
  chunkIndex: number
  tokenCount: number
}

/**
 * Splits document text into manageable structural fragments.
 * Optimized for layout preservation (MoSCoW tables, architecture stacks).
 */
export async function chunkDocument(text: string): Promise<DocumentChunk[]> {
  // 🎯 Correction Angle Mort 1 : Utilisation du MarkdownTextSplitter + Augmentation drastique de l'overlap
  const splitter = new MarkdownTextSplitter({
    chunkSize: 800,       // Fenêtre de caractères élargie (~200 tokens)
    chunkOverlap: 200,    // Recouvrement de 25% pour préserver les jointures de tableaux/stacks
  })

  const output = await splitter.createDocuments([text])

  return output.map((doc, index) => {
    // Approximation structurelle de la densité de tokens (1 token ≈ 4 caractères)
    const tokenEstimation = Math.ceil(doc.pageContent.length / 4)

    return {
      content: doc.pageContent,
      chunkIndex: index,
      tokenCount: tokenEstimation,
    }
  })
}