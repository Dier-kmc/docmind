"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import type { Source } from "@/types"

interface SourceCardProps {
  source: Source
}

export function SourceCard({ source }: SourceCardProps) {
  const [expanded, setExpanded] = useState(false)

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-emerald-400"
    if (score >= 0.6) return "text-amber-400"
    return "text-zinc-400"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return "High relevance"
    if (score >= 0.6) return "Medium relevance"
    return "Low relevance"
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:border-primary/30 transition-all duration-200"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 text-left flex items-start justify-between gap-2 hover:bg-white/5 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-zinc-300">
              Page {source.page}
            </span>
            <span className={`text-xs font-semibold ${getScoreColor(source.score)}`}>
              {Math.round(source.score * 100)}% match
            </span>
          </div>
          <p className="text-sm text-zinc-400 line-clamp-2">
            {source.text}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-zinc-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />
        )}
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-white/10 p-3 space-y-2"
        >
          <p className="text-sm text-zinc-300 leading-relaxed">
            {source.text}
          </p>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                  style={{ width: `${source.score * 100}%` }}
                />
              </div>
              <span className="text-xs text-zinc-500">
                {getScoreLabel(source.score)}
              </span>
            </div>
            <button className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
              <span>View in document</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}