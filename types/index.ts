export interface Document {
  id: string
  name: string
  file_type: "pdf" | "docx"
  file_url: string
  chunk_count: number
  created_at: string
}

export interface Chunk {
  id: string
  content: string
  chunk_index: number
  token_count: number
}

export interface Source {
  content: string
  similarity: number
  chunk_index: number
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: Source[]
  timestamp: Date
}

export interface ChatResponse {
  content: string
  sources: Source[]
}