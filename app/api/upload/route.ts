import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"
import { parseDocument, detectFileType } from "@/lib/documents/parser"
import { chunkDocument } from "@/lib/documents/chunker"
import { uploadFileToStorage } from "@/lib/documents/storage"
import { generateBatchEmbeddings } from "@/lib/rag/embeddings"
import crypto from "crypto" // 🎯 Import natif de Node.js pour pré-générer les UUIDs du graphe

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized • Non autorisé" }, { status: 401 })
  }

  const userId = session.user.id
  const db = supabaseAdmin()

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileType = detectFileType(file.type)
    const buffer = Buffer.from(await file.arrayBuffer())

    // 1. Storage Upload
    const fileUrl = await uploadFileToStorage(buffer, file.name, userId, fileType)

    // 2. Extracted Text Parsing
    const text = await parseDocument(buffer, fileType)
    if (!text || text.trim().length < 50) {
      return NextResponse.json({ error: "Document content unreadable or too short." }, { status: 400 })
    }

    // 3. Document Chunking
    const chunks = await chunkDocument(text)

    // 4. Batch Vector Generation
    const textContentArray = chunks.map(c => c.content)
    const vectorArrays = await generateBatchEmbeddings(textContentArray)

    // 5. Database Document Generation
    const { data: document, error: docError } = await db
      .from("documents")
      .insert({
        user_id: userId,
        name: file.name,
        file_url: fileUrl,
        file_type: fileType,
        chunk_count: chunks.length,
      })
      .select()
      .single()

    if (docError) throw new Error(`Document DB entry failed: ${docError.message}`)

    // 🎯 STRATÉGIE GRAPHRAG (Jour 15) : Pré-génération des IDs pour le chaînage
    // On crée un tableau d'identifiants uniques pour chaque chunk créé
    const generatedIds = chunks.map(() => crypto.randomUUID())

    // 6. Vector Matrix & Graph Connection Injection
    const chunkRows = chunks.map((chunk, index) => {
      const currentId = generatedIds[index]
      // Le nœud précédent est le voisin direct à gauche (index - 1)
      const prevChunkId = index > 0 ? generatedIds[index - 1] : null
      // Le nœud suivant est le voisin direct à droite (index + 1)
      const nextChunkId = index < chunks.length - 1 ? generatedIds[index + 1] : null

      const sanitizedContent = chunk.content
        .replace(/\0/g, '') // Supprime les caractères NUL
        .replace(/\\u0000/g, '') // Sécurité supplémentaire pour la chaîne textuelle
        .trim();

      return {
        id: currentId, // 🎯 On force notre UUID généré
        document_id: document.id,
        user_id: userId,
        content: sanitizedContent,
        chunk_index: chunk.chunkIndex,
        token_count: chunk.tokenCount,
        embedding: vectorArrays[index],
        prev_chunk_id: prevChunkId, // 🔗 Arc du graphe (En arrière)
        next_chunk_id: nextChunkId  // 🔗 Arc du graphe (En avant)
      }
    })

    // Logging de contrôle dans ta console ThinkPad
    console.log(`🔗 [GraphRAG Ingestion] Tissage du graphe linéaire pour ${chunks.length} chunks. ID Document: ${document.id}`)

    // Batch insert vector payload rows
    const { error: chunkError } = await db
      .from("document_chunks")
      .insert(chunkRows)

    if (chunkError) throw new Error(`Vector chunks database injection failed: ${chunkError.message}`)

    return NextResponse.json({
      documentId: document.id,
      chunkCount: chunks.length,
      message: "Vectorization and Graph Linkage Complete • Documents Graphed",
    })

  } catch (err: any) {
    console.error("Vectorization pipeline failure:", err)
    return NextResponse.json({ error: err.message || "Internal RAG Pipeline Error" }, { status: 500 })
  }
}