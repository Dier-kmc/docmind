import { getSupabaseServer, supabaseAdmin } from "@/lib/supabase-server" // 🎯 Vos deux imports serveurs ici
import { redirect, notFound } from "next/navigation"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ClientPdfViewer } from "@/components/viewer/client-pdf-viewer"

interface Props {
  params: Promise<{ docId: string }>
}

export default async function DocumentPage({ params }: Props) {
  // 1. Initialiser le client serveur Supabase pour la session
  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.id) redirect("/login")

  // ✅ await params avant d'accéder à ses propriétés (Excellent réflexe pour Next.js 15+)
  const { docId } = await params

  // 2. Utilisation de supabaseAdmin() importé du bon fichier serveur
  const { data: document, error } = await supabaseAdmin()
    .from("documents")
    .select("*")
    .eq("id", docId)
    .eq("user_id", user.id) // Utilisation de user.id au lieu de session.user.id
    .single()

  if (error || !document) notFound()

  const isPdf = document.file_type === "pdf"

  // Extraction du nom pour l'interface de chat
  const userName = user.user_metadata?.full_name || user.email || "Utilisateur"

  return (
    <div className="flex h-full overflow-hidden">

      {isPdf && (
        <div className="w-[45%] border-r border-border shrink-0 overflow-hidden">
          <ClientPdfViewer
            fileUrl={document.file_url}
            fileName={document.name}
          />
        </div>
      )}

      <div className={isPdf ? "flex-1 overflow-hidden" : "w-full max-w-3xl mx-auto"}>
        <ChatInterface
          document={document}
          userName={userName}
        />
      </div>
    </div>
  )
}