"use client"

import { motion } from "framer-motion"
import { Search, Cpu, Sparkles, Loader2 } from "lucide-react"

interface SearchIndicatorProps {
  stage: SearchStage
}

type SearchStage = "idle" | "searching" | "generating"

const STAGES: Record<
  SearchStage, 
  { icon: React.ComponentType<{ className?: string }>; text: string; subtext: string } | null
> = {
  idle: null, // ✅ Fixes the "Property 'idle' does not exist" error safely
  searching: {
    icon: Search,
    text: "Scanning document chunks...",
    subtext: "Querying vector space for context similarities",
  },
  generating: {
    icon: Sparkles,
    text: "Synthesizing answer...",
    subtext: "Generating localized contextual streaming response",
  },
}

export function SearchIndicator({ stage }: SearchIndicatorProps) {
  const currentStage = STAGES[stage]

  if (!currentStage) return null

  const Icon = currentStage.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start gap-3"
    >
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Icon className="w-4 h-4 text-white animate-pulse" />
        </div>
      </div>
      <div className="flex-1">
        <div className="rounded-2xl px-4 py-3 bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <Loader2 className="w-3 h-3 text-primary animate-spin" />
            <p className="text-sm font-medium text-white">{currentStage.text}</p>
          </div>
          <p className="text-xs text-zinc-400">{currentStage.subtext}</p>
        </div>
      </div>
    </motion.div>
  )
}