// types/index.ts
export interface Document {
  id: string
  user_id: string
  name: string
  original_name: string
  size: number
  type: string
  url: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  timestamp: Date
}

export interface Source {
  text: string
  page: number
  score: number
  document_name: string
}

export interface ChatResponse {
  answer: string
  sources: Source[]
  context: string[]
}

export interface Chunk {
  id: string
  document_id: string
  text: string
  page: number
  embedding: number[]
  created_at: string
}