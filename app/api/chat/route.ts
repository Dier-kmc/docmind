import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { runRAGPipeline } from "@/lib/rag/pipeline"
import { GoogleGenerativeAI } from "@google/generative-ai"

const getGemini = () => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("Missing GOOGLE_API_KEY")
  }
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
}

export async function POST(req: NextRequest) {
  // Auth
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const { documentId, messages } = await req.json()

    if (!documentId || !messages?.length) {
      return NextResponse.json(
        { error: "Missing documentId or messages" },
        { status: 400 },
      )
    }

    // Dernière question de l'user
    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "Last message must be from user" },
        { status: 400 },
      )
    }

    const query = lastMessage.content

    // 1. Pipeline RAG — récupère contexte + sources
    const { systemPrompt, sources } = await runRAGPipeline({
      query,
      documentId,
      userId,
      conversationHistory: messages.slice(0, -1),
    })

    // 2. Prépare l'historique pour Gemini
    const history = messages.slice(0, -1).map((m: any) => ({
      role:  m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }))

    // 3. Démarre le stream Gemini
    const model = getGemini()
    const chat = model.startChat({
  history,
  // ✅ Format correct pour Gemini
  systemInstruction: {
    role: "user",
    parts: [{ text: systemPrompt }],
  },
})

    const result = await chat.sendMessageStream(query)

    // 4. Stream la réponse avec les sources en header
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        // Envoie les sources en premier
        const sourcesLine = `__SOURCES__:${JSON.stringify(sources)}\n`
        controller.enqueue(encoder.encode(sourcesLine))

        // Stream le texte
        for await (const chunk of result.stream) {
          const text = chunk.text()
          if (text) {
            controller.enqueue(encoder.encode(`data: ${text}\n`))
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n"))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type":  "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection":    "keep-alive",
      },
    })

  } catch (err: any) {
    console.error("Chat error:", err)
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 },
    )
  }
}