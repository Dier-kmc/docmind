"use client"

import { useState } from "react"
import { FileText, Trash2, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Document {
  id: string
  name: string
  file_type: string
  chunk_count: number
  created_at: string
}

interface Props {
  document: Document
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
}

export function DocumentItem({ document, isActive, onSelect, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await fetch(`/api/documents/${document.id}`, { method: "DELETE" })
      onDelete()
    } catch {
      // silently fail for now
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    })
  }

  return (
    <div
      className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
        isActive
          ? "bg-primary/10 text-primary"
          : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
      }`}
      onClick={onSelect}
    >
      {/* Icône */}
      <FileText
        size={14}
        className={`shrink-0 ${isActive ? "text-primary" : ""}`}
      />

      {/* Nom + date */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium truncate ${isActive ? "text-primary" : ""}`}>
          {document.name}
        </p>
        <p className="text-[10px] text-muted-foreground/70 mt-0.5">
          {document.chunk_count} chunks · {formatDate(document.created_at)}
        </p>
      </div>

      {/* Bouton suppression */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-destructive transition-all shrink-0"
          >
            {deleting
              ? <Loader2 size={11} className="animate-spin" />
              : <Trash2 size={11} />
            }
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce document ?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium">{document.name}</span> et tous ses chunks
              seront définitivement supprimés. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}