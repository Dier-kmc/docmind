import { auth } from "@/lib/auth";
import { runRAGPipeline } from "@/lib/rag/pipeline";
import { estimateTokens } from "@/lib/rag/context-builder";
import { supabaseAdmin } from "@/lib/supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; 

const getGemini = () => {
  if (!process.env.GOOGLE_API_KEY) throw new Error("Missing GOOGLE_API_KEY");
  return new GoogleGenerativeAI(process.env.GOOGLE_API_KEY).getGenerativeModel({ 
    model: "gemini-2.5-flash"
  });
};

// 🎯 CONFIGURATION DE LA MÉMOIRE (JOUR 13)
// 6 messages = les 3 dernières requêtes de l'utilisateur + les 3 dernières réponses de l'IA
const MEMORY_WINDOW_SIZE = 6; 

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  try {
    const { documentId, messages } = await req.json();
    if (!documentId || !messages?.length) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const lastMessage = messages[messages.length - 1];
    const query = lastMessage.content;

    // 1. Extraction de l'historique récent pour le pipeline (Memory Window)
    // On exclut le tout dernier message (qui est la query actuelle) avant de couper
    const fullHistory = messages.slice(0, -1);
    const recentHistoryForPipeline = fullHistory.slice(-MEMORY_WINDOW_SIZE);

    // 2. Pipeline RAG avec injection de l'historique récent
    const { systemPrompt, sources } = await runRAGPipeline({
      query,
      documentId,
      userId,
      conversationHistory: recentHistoryForPipeline,
    });

    const inputTokens = estimateTokens(systemPrompt + query);

    // 3. Formatage strict et filtré de l'historique pour l'API Gemini
    // On applique également la MEMORY_WINDOW_SIZE ici pour synchroniser le chat Gemini
    const history = recentHistoryForPipeline
      .filter((m: any) => m.content?.trim() !== "" && m.role !== "system")
      .map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const model = getGemini();
    
    const chat = model.startChat({
      history: history.length > 0 ? history : [],
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt }],
      },
    });

    // Logging de contrôle pour valider le Jour 13 dans ta console
    console.log(`🧠 [MEMORY WINDOW] Total messages in state: ${messages.length} | Sent to Gemini: ${history.length + 1}`);

    const result = await chat.sendMessageStream(query);
    const encoder = new TextEncoder();
    let fullOutputText = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(encoder.encode(`__SOURCES__:${JSON.stringify(sources)}\n`));

          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              fullOutputText += text;
              controller.enqueue(encoder.encode(`data: ${text}\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n"));

          // 🧮 Enregistrement FinOps
          const outputTokens = estimateTokens(fullOutputText);
          const totalCost = (inputTokens * (0.075 / 1000000)) + (outputTokens * (0.30 / 1000000));

          const supabase = supabaseAdmin();
          await supabase.from("ai_usage_logs").insert({
            user_id: userId,
            document_id: documentId,
            tokens_input: inputTokens,
            tokens_output: outputTokens,
            cost_usd: totalCost
          });

          console.log(`💰 [FINOPS SUCCESS] Cost: $${totalCost.toFixed(6)} | In: ${inputTokens} tks, Out: ${outputTokens} tks`);

        } catch (streamError) {
          console.error("❌ Error during stream execution:", streamError);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });

  } catch (err: any) {
    console.error("❌ [CRITICAL CHAT ROUTE ERROR]:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}


// import { auth } from "@/lib/auth";
// import { runRAGPipeline } from "@/lib/rag/pipeline";
// import { estimateTokens } from "@/lib/rag/context-builder";
// import { supabaseAdmin } from "@/lib/supabase";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { NextRequest, NextResponse } from "next/server";

// // 🎯 CORRECTION : On passe sur le runtime Node.js standard pour éviter les limitations d'Edge avec HuggingFace + Gemini Streams
// export const runtime = "nodejs"; 

// const getGemini = () => {
//   if (!process.env.GOOGLE_API_KEY) throw new Error("Missing GOOGLE_API_KEY");
//   return new GoogleGenerativeAI(process.env.GOOGLE_API_KEY).getGenerativeModel({ 
//     model: "gemini-2.5-flash" // Assure-toi que le nom du modèle est bien orthographié
//   });
// };

// export async function POST(req: NextRequest) {
//   const session = await auth();
//   if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const userId = session.user.id;

//   try {
//     const { documentId, messages } = await req.json();
//     if (!documentId || !messages?.length) return NextResponse.json({ error: "Missing data" }, { status: 400 });

//     const query = messages[messages.length - 1].content;

//     // 1. Pipeline RAG
//     const { systemPrompt, sources } = await runRAGPipeline({
//       query,
//       documentId,
//       userId,
//       conversationHistory: messages.slice(0, -1),
//     });

//     const inputTokens = estimateTokens(systemPrompt + query);

//     // Formatage strict de l'historique pour l'API Gemini
//     const history = messages.slice(0, -1)
//       .filter((m: any) => m.content?.trim() !== "" && m.role !== "system")
//       .map((m: any) => ({
//         role: m.role === "assistant" ? "model" : "user",
//         parts: [{ text: m.content }],
//       }));

//     const model = getGemini();
    
//     // 🎯 INITIALISATION SÉCURISÉE : On s'assure que l'instruction système passe sans encombre
//     const chat = model.startChat({
//       history: history.length > 0 ? history : [],
//       // systemInstruction: systemPrompt, // Le SDK accepte directement la string ou l'objet structuré
//       systemInstruction: {
//         role: "system",
//         parts: [{ text: systemPrompt }],
//       },
//     });

//     const result = await chat.sendMessageStream(query);
//     const encoder = new TextEncoder();
//     let fullOutputText = "";

//     // 2. Génération du TransformStream pour Node.js compliant streaming
//     const stream = new ReadableStream({
//       async start(controller) {
//         try {
//           // Injection des sources pour ton composant SourceCard UI
//           controller.enqueue(encoder.encode(`__SOURCES__:${JSON.stringify(sources)}\n`));

//           for await (const chunk of result.stream) {
//             const text = chunk.text();
//             if (text) {
//               fullOutputText += text;
//               controller.enqueue(encoder.encode(`data: ${text}\n`));
//             }
//           }
//           controller.enqueue(encoder.encode("data: [DONE]\n"));

//           // 🧮 Enregistrement FinOps asynchrone
//           const outputTokens = estimateTokens(fullOutputText);
//           const totalCost = (inputTokens * (0.075 / 1000000)) + (outputTokens * (0.30 / 1000000));

//           const supabase = supabaseAdmin();
//           await supabase.from("ai_usage_logs").insert({
//             user_id: userId,
//             document_id: documentId,
//             tokens_input: inputTokens,
//             tokens_output: outputTokens,
//             cost_usd: totalCost
//           });

//           console.log(`💰 [FINOPS SUCCESS] Cost: $${totalCost.toFixed(6)} | In: ${inputTokens} tks, Out: ${outputTokens} tks`);

//         } catch (streamError) {
//           console.error("❌ Error during stream execution:", streamError);
//         } finally {
//           controller.close();
//         }
//       },
//     });

//     return new Response(stream, {
//       headers: {
//         "Content-Type": "text/event-stream; charset=utf-8",
//         "Cache-Control": "no-cache",
//         "Connection": "keep-alive",
//       },
//     });

//   } catch (err: any) {
//     console.error("❌ [CRITICAL CHAT ROUTE ERROR]:", err);
//     return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
//   }
// }

// import { auth } from "@/lib/auth";
// import { runRAGPipeline } from "@/lib/rag/pipeline";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { NextRequest, NextResponse } from "next/server";

// export const runtime = "edge";

// const getGemini = () => {
//   if (!process.env.GOOGLE_API_KEY) {
//     throw new Error("Missing GOOGLE_API_KEY");
//   }
//   const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
//   return genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
// };

// export async function POST(req: NextRequest) {
//   const session = await auth();
//   if (!session?.user?.id) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const userId = session.user.id;

//   try {
//     const { documentId, messages } = await req.json();

//     if (!documentId || !messages?.length) {
//       return NextResponse.json(
//         { error: "Missing documentId or messages" },
//         { status: 400 },
//       );
//     }

//     const lastMessage = messages[messages.length - 1];
//     if (lastMessage.role !== "user") {
//       return NextResponse.json(
//         { error: "Last message must be from user" },
//         { status: 400 },
//       )
//     }

//     const query = lastMessage.content;

//     // 1. Pipeline RAG — récupère contexte + sources
//     const { systemPrompt, sources } = await runRAGPipeline({
//       query,
//       documentId,
//       userId,
//       conversationHistory: messages.slice(0, -1),
//     });

//     // 2. Prépare l'historique pour Gemini (Nettoyage des messages vides)
//     const history = messages
//       .slice(0, -1)
//       .filter((m: any) => m.content && m.content.trim() !== "")
//       .map((m: any) => ({
//         role: m.role === "assistant" ? "model" : "user",
//         parts: [{ text: m.content }],
//       }));

//     // 3. Démarre le stream Gemini avec la bonne syntaxe
//     // 3. Démarre le stream Gemini avec la structure d'objet stricte attendue
//     const model = getGemini();

//     const chat = model.startChat({
//       history,
//       // 🎯 CORRECTION STRICTE : Respect exact du type google.ai.generativelanguage.v1beta.Content
//       systemInstruction: {
//         role: "system",
//         parts: [{ text: systemPrompt }],
//       },
//     });

//     const result = await chat.sendMessageStream(query);

//     // const result = await chat.sendMessageStream(query);

//     // 4. Préparation du stream de réponse
//     const encoder = new TextEncoder();
    
//     // Encodage URL ultra-safe pour éviter le plantage ByteString sur ton ThinkPad
//     const safeSourcesHeader = encodeURIComponent(JSON.stringify(sources));

//     const stream = new ReadableStream({
//       async start(controller) {
//         try {
//           // Si ton client parse le corps du texte (ancienne méthode __SOURCES__) :
//           const sourcesLine = `__SOURCES__:${JSON.stringify(sources)}\n`;
//           controller.enqueue(encoder.encode(sourcesLine));

//           for await (const chunk of result.stream) {
//             const text = chunk.text();
//             if (text) {
//               controller.enqueue(encoder.encode(`data: ${text}\n`));
//             }
//           }
//           controller.enqueue(encoder.encode("data: [DONE]\n"));
//         } catch (e) {
//           console.error("Erreur durant le streaming des chunks:", e);
//         } finally {
//           controller.close();
//         }
//       },
//     });

//     return new Response(stream, {
//       headers: {
//         "Content-Type": "text/event-stream; charset=utf-8",
//         "Cache-Control": "no-cache",
//         "Connection": "keep-alive",
//         // 🎯 On envoie aussi dans le header au cas où ton hook useChat l'attend là-bas
//         "X-Sources": safeSourcesHeader, 
//       },
//     });

//   } catch (err: any) {
//     console.error("Chat error:", err);
//     return NextResponse.json(
//       { error: err.message || "Internal error" },
//       { status: 500 },
//     );
//   }
// }