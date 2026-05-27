"use client"

import { Loader2 } from "lucide-react"

export function SearchIndicator() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl rounded-tl-sm bg-muted/60 w-fit max-w-xs">
      <Loader2 size={13} className="text-primary animate-spin shrink-0" />
      <span className="text-xs text-muted-foreground">
        Searching document • Recherche dans le document...
      </span>
    </div>
  )
}