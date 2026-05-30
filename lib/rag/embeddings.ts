import { HfInference } from "@huggingface/inference"

export const EMBEDDING_DIMENSION = 384

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

// 🎯 Correction Angle Mort 3 : Wrapper de résilience réseau (Timeout à 30s + Retry Exponentiel)
async function fetchWithRetry(fn: () => Promise<any>, retries = 2, delay = 1000): Promise<any> {
  try {
    // Crée une promesse qui rejette après un timeout spécifique
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT_EXCEEDED")), 30000) // 30 secondes de timeout
    );

    // Course entre la fonction d'inférence et le garde-fou de 30s
    return await Promise.race([fn(), timeoutPromise]);
  } catch (error: any) {
    if (retries > 0 && (error.message === "TIMEOUT_EXCEEDED" || error.code === "UND_ERR_CONNECT_TIMEOUT")) {
      console.warn(`⚠️ [EMBEDDINGS RETRY] Invérence ralentie ou expirée. Nouvelle tentative dans ${delay}ms... (${retries} restantes)`);
      await new Promise((res) => setTimeout(res, delay));
      return fetchWithRetry(fn, retries - 1, delay * 2); // Délai exponentiel
    }
    throw error;
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    return await fetchWithRetry(() => 
      hf.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: text,
      })
    ) as number[]
  } catch (error: any) {
    console.error("❌ HuggingFace embedding failed permanently:", error)
    throw new Error(`Failed to generate embedding after retries: ${error.message}`)
  }
}

export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    return await fetchWithRetry(() => 
      hf.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: texts,
      })
    ) as number[][]
  } catch (error: any) {
    console.error("❌ HuggingFace batch embedding failed permanently:", error)
    throw new Error(`Failed to generate batch embeddings after retries: ${error.message}`)
  }
}