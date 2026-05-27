import { HfInference } from "@huggingface/inference"

export const EMBEDDING_DIMENSION = 384

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

const getEmbedding = async (text: string): Promise<number[]> => {
  const result = await hf.featureExtraction({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    inputs: text,
  })

  return result as number[]
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    return await getEmbedding(text)
  } catch (error: any) {
    console.error("HuggingFace embedding failed:", error)
    throw new Error(`Failed to generate embedding: ${error.message}`)
  }
}

export async function generateBatchEmbeddings(
  texts: string[],
): Promise<number[][]> {
  try {
    const result = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: texts,
    })
    return result as number[][]
  } catch (error: any) {
    console.error("HuggingFace batch embedding failed:", error)
    throw new Error(`Failed to generate batch embeddings: ${error.message}`)
  }
}