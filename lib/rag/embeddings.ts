import { OpenAIEmbeddings } from "@langchain/openai"

// Safe fallback initializer
const getEmbeddingModel = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment configuration variable.")
  }
  return new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "text-embedding-3-small", 
  })
}

/**
 * Transforms a text string into a 1536-dimensional float vector array
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const embeddings = getEmbeddingModel()
    return await embeddings.embedQuery(text)
  } catch (error: any) {
    console.error("OpenAI Embedding generation failed:", error)
    throw new Error(`Failed to generate mathematical vector: ${error.message}`)
  }
}

/**
 * Batches text arrays to speed up large document indexing
 */
export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const embeddings = getEmbeddingModel()
    return await embeddings.embedDocuments(texts)
  } catch (error: any) {
    console.error("OpenAI Batch Embedding generation failed:", error)
    throw new Error(`Failed to generate batch vectors: ${error.message}`)
  }
}