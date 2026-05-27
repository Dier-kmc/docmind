import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase"
import { ChatInterface } from "@/components/chat/chat-interface"
import { PdfViewer } from "@/components/viewer/pdf-viewer"

interface Props {
  params: Promise<{ docId: string }>
}

export default async function DocumentPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  // ✅ await params avant d'accéder à ses propriétés
  const { docId } = await params

  const { data: document, error } = await supabaseAdmin()
    .from("documents")
    .select("*")
    .eq("id", docId)
    .eq("user_id", session.user.id)
    .single()

  if (error || !document) notFound()

  const isPdf = document.file_type === "pdf"

  return (
    <div className="flex h-full overflow-hidden">

      {isPdf && (
        <div className="w-[45%] border-r border-border shrink-0 overflow-hidden">
          <PdfViewer
            fileUrl={document.file_url}
            fileName={document.name}
          />
        </div>
      )}

      <div className={isPdf ? "flex-1 overflow-hidden" : "w-full max-w-3xl mx-auto"}>
        <ChatInterface
          document={document}
          userName={session.user.name}
        />
      </div>

    </div>
  )
}