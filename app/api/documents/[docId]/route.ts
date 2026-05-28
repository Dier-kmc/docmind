import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"

// 🎯 Signature asynchrone des params conforme à Next.js 15/16
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ docId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 🎯 On attend la résolution de la promesse pour extraire la variable d'URL
  const { docId } = await params
  const db = supabaseAdmin()

  // Vérifie que le document appartient bien à cet user
  const { data: doc } = await db
    .from("documents")
    .select("id, file_url")
    .eq("id", docId)
    .eq("user_id", session.user.id)
    .single()

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }

  // Supprime en cascade (chunks supprimés automatiquement via FK)
  const { error } = await db
    .from("documents")
    .delete()
    .eq("id", docId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}