"use client"

import { Loader2, FileText, Cpu, CheckCircle2 } from "lucide-react"

interface Props {
  stage: "idle" | "uploading" | "parsing" | "embedding" | "done"
  progress: number
}

const STAGES = {
  uploading: {
    title: "Uploading raw asset",
    description: "Transferring target document to secure storage...",
    icon: FileText,
  },
  parsing: {
    title: "Extracting file layers",
    description: "Running lexical scanners over data buffers...",
    icon: Loader2,
  },
  embedding: {
    title: "Vectorizing knowledge chunks",
    description: "Injecting structural semantic index arrays...",
    icon: Cpu,
  },
  done: {
    title: "Workspace Authorized",
    description: "Document context map generated successfully.",
    icon: CheckCircle2,
  },
  idle: {
    title: "Preparing pipeline",
    description: "Warming worker instances...",
    icon: Loader2,
  },
}

export function UploadProgress({ stage, progress }: Props) {
  const current = STAGES[stage]
  const Icon = current.icon
  const isDone = stage === "done"

  return (
    <div className="w-full h-64 rounded-2xl bg-card border border-transparent flex flex-col items-center justify-center p-8 space-y-6">
      
      {/* Dynamic Stage Indicator Icon */}
      <div className={`
        w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-sm
        ${isDone 
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-emerald-500/5 scale-105" 
          : "bg-muted/80 border-border/50 text-primary"
        }
      `}>
        {stage === "parsing" || stage === "idle" ? (
          <Icon size={22} className="animate-spin" />
        ) : (
          <Icon size={22} className={isDone ? "" : "animate-pulse"} />
        )}
      </div>

      {/* Label and Explanatory Context */}
      <div className="text-center space-y-1.5 w-full max-w-sm">
        <p className="text-sm font-semibold text-foreground tracking-tight transition-all">
          {current.title}
        </p>
        <p className="text-xs text-muted-foreground/80 line-clamp-1">
          {current.description}
        </p>
      </div>

      {/* Modern High-Fidelity Progress System */}
      <div className="w-full max-w-md space-y-2">
        <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden border border-border/20">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isDone ? "bg-emerald-500" : "bg-primary"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-end text-[10px] font-bold text-muted-foreground tracking-widest tabular-nums">
          {progress}%
        </div>
      </div>

    </div>
  )
}