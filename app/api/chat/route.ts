import { auth } from "@/lib/auth";
import { runRAGPipeline } from "@/lib/rag/pipeline";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const getGemini = () => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("Missing GOOGLE_API_KEY");
  }
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const { documentId, messages } = await req.json();

    if (!documentId || !messages?.length) {
      return NextResponse.json(
        { error: "Missing documentId or messages" },
        { status: 400 },
      );
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "Last message must be from user" },
        { status: 400 },
      )
    }

    const query = lastMessage.content;

    // 1. Pipeline RAG — récupère contexte + sources
    const { systemPrompt, sources } = await runRAGPipeline({
      query,
      documentId,
      userId,
      conversationHistory: messages.slice(0, -1),
    });

    // 2. Prépare l'historique pour Gemini (Nettoyage des messages vides)
    const history = messages
      .slice(0, -1)
      .filter((m: any) => m.content && m.content.trim() !== "")
      .map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    // 3. Démarre le stream Gemini avec la bonne syntaxe
    // 3. Démarre le stream Gemini avec la structure d'objet stricte attendue
    const model = getGemini();

    const chat = model.startChat({
      history,
      // 🎯 CORRECTION STRICTE : Respect exact du type google.ai.generativelanguage.v1beta.Content
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt }],
      },
    });

    const result = await chat.sendMessageStream(query);

    // const result = await chat.sendMessageStream(query);

    // 4. Préparation du stream de réponse
    const encoder = new TextEncoder();
    
    // Encodage URL ultra-safe pour éviter le plantage ByteString sur ton ThinkPad
    const safeSourcesHeader = encodeURIComponent(JSON.stringify(sources));

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Si ton client parse le corps du texte (ancienne méthode __SOURCES__) :
          const sourcesLine = `__SOURCES__:${JSON.stringify(sources)}\n`;
          controller.enqueue(encoder.encode(sourcesLine));

          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(`data: ${text}\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n"));
        } catch (e) {
          console.error("Erreur durant le streaming des chunks:", e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        // 🎯 On envoie aussi dans le header au cas où ton hook useChat l'attend là-bas
        "X-Sources": safeSourcesHeader, 
      },
    });

  } catch (err: any) {
    console.error("Chat error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 },
    );
  }
}