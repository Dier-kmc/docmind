import { NextResponse } from "next/server"
import { getSupabaseServer, supabaseAdmin } from "@/lib/supabase-server"

export async function GET() {
  const supabaseServer = await getSupabaseServer()
    const { data: { user } } = await supabaseServer.auth.getUser()
  
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  
    const userId = user.id

  const { data, error } = await supabaseAdmin()
    .from("documents")
    .select("id, name, file_type, chunk_count, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ documents: data })
}