"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Quote } from "lucide-react"
import { Source } from "@/types"

interface Props {
  sources: Source[]
}

export function SourceCard({ sources }: Props) {
  const [expanded, setExpanded] = useState(false)

  if (!sources || sources.length === 0) return null

  return (
    <div className="mt-3 space-y-1.5">
      {/* Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <Quote size={11} />
        {sources.length} source{sources.length > 1 ? "s" : ""} •{" "}
        {expanded
          ? "Hide • Masquer"
          : "Show • Afficher"}
        {expanded
          ? <ChevronUp size={11} />
          : <ChevronDown size={11} />
        }
      </button>

      {/* Sources list */}
      {expanded && (
        <div className="space-y-2">
          {sources.map((source, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-muted/30 px-3 py-2.5 space-y-1.5"
            >
              {/* Score */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Source {i + 1}
                </span>
                <span className={`
                  text-[10px] font-bold px-2 py-0.5 rounded-full
                  ${source.similarity >= 0.85
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : source.similarity >= 0.75
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      : "bg-muted text-muted-foreground"
                  }
                `}>
                  {Math.round(source.similarity * 100)}% match
                </span>
              </div>

              {/* Passage */}
              <p className="text-xs text-foreground/80 leading-relaxed line-clamp-4">
                {source.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}