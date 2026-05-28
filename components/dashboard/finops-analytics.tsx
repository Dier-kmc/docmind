"use client"

import { useEffect, useState } from "react"
import { Coins, BarChart3, Calculator, Activity, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"



interface Metrics {
  totalRequests: number
  totalCost: number
  totalInputTokens: number
  totalOutputTokens: number
  costPerThousand: number
}

export function FinOpsAnalytics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)

  // 1. Fonction de récupération des données historiques
  async function fetchMetrics() {
    try {
      const res = await fetch("/api/analytics")
      if (res.ok) {
        const data = await res.json()
        setMetrics(data)
      }
    } catch (err) {
      console.error("Failed to load FinOps metrics:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Charger les données initiales au montage
    fetchMetrics()

    // 🎯 ECOUTE REALTIME (SUPABASE WEBSOCKET)
    // On s'abonne aux insertions dans la table 'ai_usage_logs'
    const channel = supabase
      .channel("finops-realtime-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ai_usage_logs",
        },
        (payload) => {
          console.log("⚡ [REALTIME FINOPS] New log detected! Recalculating totals...", payload.new)
          
          // Plutôt que de refaire un fetch complet vers l'API, on incrémente l'état local instantanément
          setMetrics((prev) => {
            if (!prev) return null
            const newCost = prev.totalCost + (Number(payload.new.cost_usd) || 0)
            const newRequests = prev.totalRequests + 1

            return {
              totalRequests: newRequests,
              totalCost: newCost,
              totalInputTokens: prev.totalInputTokens + (payload.new.tokens_input || 0),
              totalOutputTokens: prev.totalOutputTokens + (payload.new.tokens_output || 0),
              costPerThousand: newRequests > 0 ? (newCost / newRequests) * 1000 : 0
            }
          })
        }
      )
      .subscribe()

    // Nettoyage de la connexion WebSocket au démontage du composant
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading) {
    return (
      <div className="h-28 border border-border rounded-xl flex items-center justify-center bg-card/40 backdrop-blur-sm">
        <Loader2 size={18} className="animate-spin text-primary mr-2" />
        <span className="text-xs text-muted-foreground font-medium">Computing FinOps telemetry...</span>
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Activity size={14} className="text-primary animate-pulse" />
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Infrastructure Observability & FinOps <span className="text-[10px] text-emerald-500 font-bold lowercase bg-emerald-500/10 px-1.5 py-0.5 rounded-full ml-2">live</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Cost */}
        <div className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            <Coins size={18} />
          </div>
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase">Accumulated Cost</p>
            <p className="text-lg font-bold tracking-tight font-sans text-emerald-600 dark:text-emerald-400 transition-all">
              ${metrics.totalCost.toFixed(5)}
            </p>
          </div>
        </div>

        {/* Cost / 1000 requests */}
        <div className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <Calculator size={18} />
          </div>
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase">Projected / 1K Req.</p>
            <p className="text-lg font-bold tracking-tight text-primary font-sans">${metrics.costPerThousand.toFixed(4)}</p>
          </div>
        </div>

        {/* Total Queries */}
        <div className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500">
            <BarChart3 size={18} />
          </div>
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase">Processed Queries</p>
            <p className="text-lg font-bold tracking-tight font-sans transition-all">{metrics.totalRequests}</p>
          </div>
        </div>

        {/* Token Volume */}
        <div className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase">Total Tokens (In/Out)</p>
            <p className="text-xs font-semibold text-muted-foreground mt-0.5 font-sans">
              I: <span className="text-foreground font-bold">{(metrics.totalInputTokens / 1000).toFixed(1)}k</span> | 
              O: <span className="text-foreground font-bold">{(metrics.totalOutputTokens / 1000).toFixed(1)}k</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}