// import { auth } from "@/lib/auth"
// import { redirect } from "next/navigation"
// import { supabaseAdmin } from "@/lib/supabase"

// interface ChatPageProps {
//   params: Promise<{
//     docId: string
//   }>
// }

// // 🎯 CRITICAL: It MUST be an "export default function"
// export default async function DocumentChatPage({ params }: ChatPageProps) {
//   // Protect the route
//   const session = await auth()
//   if (!session) redirect("/login")

//   // Safely await route params in modern Next.js
//   const resolvedParams = await params
//   const { docId } = resolvedParams

//   // Fetch document metadata to display its name in the chat window header
//   const db = supabaseAdmin()
//   const { data: document } = await db
//     .from("documents")
//     .select("*")
//     .eq("id", docId)
//     .single()

//   if (!document) {
//     return (
//       <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
//         <p className="text-sm font-medium text-destructive">Document not found</p>
//         <p className="text-xs text-muted-foreground mt-1">This file might have been deleted.</p>
//       </div>
//     )
//   }

//   return (
//     <div className="flex-1 flex flex-col h-full bg-background">
//       {/* Chat Workspace Header */}
//       <header className="h-14 border-b border-border px-6 flex items-center justify-between bg-card/40 shrink-0">
//         <div className="flex items-center gap-3 min-w-0">
//           <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase shrink-0">
//             {document.file_type}
//           </span>
//           <h2 className="text-sm font-semibold truncate text-foreground">
//             {document.name}
//           </h2>
//         </div>
//       </header>

//       {/* Chat History & Input Container Area */}
//       <div className="flex-1 overflow-y-auto p-6 space-y-4">
//         <div className="max-w-2xl mx-auto p-4 rounded-xl border border-border/60 bg-muted/20 text-xs text-muted-foreground">
//           🤖 Ready to analyze. Ask anything about <span className="font-medium text-foreground">{document.name}</span>.
//         </div>
//         {/* Your <ChatMessages /> interface will go here */}
//       </div>

//       {/* Chat Input Dock */}
//       <div className="p-4 bg-background border-t border-border shrink-0">
//         <div className="max-w-2xl mx-auto flex gap-2">
//           <input 
//             type="text" 
//             placeholder="Ask a question about this document..." 
//             className="flex-1 min-h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
//           />
//           <button className="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90">
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PDFViewer } from "@/components/viewer/pdf-viewer"
import { ChatInterface } from "@/components/chat/chat-interface"
import { getDocument } from "@/lib/documents/queries"

interface DocumentPageProps {
  params: Promise<{
    docId: string
  }>
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const session = await auth()
  if (!session) redirect("/login")

  // 1. Resolve the parameters promise cleanly
  const resolvedParams = await params
  const docId = resolvedParams?.docId

  // 🎯 2. THE CRITICAL GUARD: Check if docId is missing, empty, or evaluates to a literal string "undefined"
  if (!docId || docId === "undefined") {
    console.warn("⚠️ Route parameters evaluated to undefined on initial hydration render pass.")
    redirect("/dashboard")
  }

  // 3. This query execution is now guaranteed to receive a valid string format
  const document = await getDocument(docId, session.user?.id)

  if (!document) {
    redirect("/dashboard")
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Left Panel - PDF Viewer */}
      <div className="flex-1 flex flex-col border-r border-border bg-card/10">
        <PDFViewer url={document.file_url} documentName={document.name} />
      </div>

      {/* Right Panel - Chat Interface */}
      <div className="w-[450px] flex flex-col shrink-0 border-l border-border/40">
        <ChatInterface documentId={docId} />
      </div>
    </div>
  )
}