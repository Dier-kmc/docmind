import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const supabase = supabaseAdmin()

  try {
    // Récupérer tous les logs d'usage de l'utilisateur
    const { data: logs, error } = await supabase
      .from("ai_usage_logs")
      .select("tokens_input, tokens_output, cost_usd, created_at")
      .eq("user_id", userId)

    if (error) throw error

    const totalRequests = logs?.length || 0
    let totalCost = 0
    let totalInputTokens = 0
    let totalOutputTokens = 0

    logs?.forEach((log) => {
      totalCost += log.cost_usd || 0
      totalInputTokens += log.tokens_input || 0
      totalOutputTokens += log.tokens_output || 0
    })

    // 🧮 Calcul de projection FinOps (Coût moyen pour 1000 requêtes)
    const costPerThousand = totalRequests > 0 
      ? (totalCost / totalRequests) * 1000 
      : 0

    return NextResponse.json({
      totalRequests,
      totalCost,
      totalInputTokens,
      totalOutputTokens,
      costPerThousand,
      metricsPeriod: "All-time usage"
    })

  } catch (err: any) {
    console.error("❌ [ANALYTICS ROUTE ERROR]:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}