"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"
import { UploadProgress } from "./upload-progress"
import { CloudUpload, FileText } from "lucide-react"

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
}

const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export function UploadZone() {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState<"idle" | "uploading" | "parsing" | "embedding" | "done">("idle")

  const processFile = async (file: File) => {
    setUploading(true)
    setStage("uploading")
    setProgress(15)

    const formData = new FormData()
    formData.append("file", file)

    try {
      setStage("parsing")
      setProgress(40)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Upload failed")
      }

      setStage("embedding")
      setProgress(75)

      const { documentId } = await res.json()

      setProgress(100)
      setStage("done")

      toast.success("Document processed successfully", {
        description: "Opening secure analysis chat workspace...",
      })

      setTimeout(() => {
        router.push(`/dashboard/${documentId}`)
        router.refresh()
      }, 600)

    } catch (err: any) {
      toast.error("Upload process failed", {
        description: err.message || "An unexpected parser error occurred.",
      })
      setUploading(false)
      setStage("idle")
      setProgress(0)
    }
  }

  const onDrop = useCallback((accepted: File[], rejected: any[]) => {
    if (rejected.length > 0) {
      const reason = rejected[0].errors[0].code
      if (reason === "file-too-large") {
        toast.error("File is too large", { description: "Maximum supported size is 10MB." })
      } else {
        toast.error("Invalid file format", { description: "Only standard PDF and DOCX files are allowed." })
      }
      return
    }
    if (accepted.length > 0) processFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
    disabled: uploading,
  })

  if (uploading) {
    return <UploadProgress stage={stage} progress={progress} />
  }

  return (
    <div
      {...getRootProps()}
      className={`
        relative flex flex-col items-center justify-center w-full h-64 hover:cursor-pointer
        rounded-2xl border-2 border-dashed transition-all duration-300 select-none
        ${isDragActive
          ? "border-primary bg-primary/[0.02] bg-radial scale-[0.99]"
          : "border-border hover:border-primary/40 hover:bg-muted/30"
        }
      `}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-4 text-center px-6">
        {/* Animated Active Icon Wrapper */}
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 shadow-sm
          ${isDragActive 
            ? "bg-primary border-primary text-primary-foreground scale-110 shadow-primary/20" 
            : "bg-background border-border text-muted-foreground"
          }
        `}>
          {isDragActive ? <CloudUpload size={20} className="animate-bounce" /> : <FileText size={20} />}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground tracking-tight">
            {isDragActive ? "Drop your file here to analyze" : "Drag & drop your file here"}
          </p>
          <p className="text-xs text-muted-foreground">
            or <span className="text-primary font-medium hover:underline">browse files</span> on your device
          </p>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 pt-2">
          {["PDF", "DOCX"].map((type) => (
            <span
              key={type}
              className="text-[10px] font-medium tracking-wider px-2 py-0.5 rounded-md bg-muted border border-border/50 text-muted-foreground"
            >
              {type}
            </span>
          ))}
          <span className="text-[11px] text-muted-foreground/80 ml-1">up to 10MB</span>
        </div>
      </div>
    </div>
  )
}