"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase" 
import { DocumentItem } from "./document-item"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FilePlus,
  LogOut,
  ChevronDown,
  FileText,
  LayoutDashboard,
} from "lucide-react"

interface Document {
  id: string
  name: string
  file_type: string
  chunk_count: number
  created_at: string
}

interface Props {
  user: {
    id?: string
    name?: string | null
    email?: string | null
  }
}

export function DocumentSidebar({ user }: Props) {
  const router   = useRouter()
  const params   = useParams()
  const supabase = getSupabaseBrowser() // 🎯 Initialisation de l'instance
  const activeId = params?.docId as string | undefined

  const [documents, setDocuments] = useState<Document[]>([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const res  = await fetch("/api/documents")
      const data = await res.json()
      setDocuments(data.documents ?? [])
    } catch {
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  // 🎯 Fonction de déconnexion Supabase
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.refresh() // Synchronise l'état global et vide le cache des routes
      router.push("/login")
    } catch (err) {
      console.error("Erreur lors de la déconnexion :", err)
    }
  }

  const initials = (name?: string | null) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?"

  return (
    <aside className="w-64 flex flex-col border-r border-border bg-card shrink-0">

      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <span className="font-bold text-sm tracking-tight">DocMind</span>
      </div>

      {/* Navigation */}
      <div className="px-3 py-3 border-b border-border">
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          <LayoutDashboard size={15} />
          Dashboard
        </button>
      </div>

      {/* Documents list */}
      <div className="flex-1 overflow-y-auto py-3 px-3 flex flex-col gap-1">

        {/* Label + bouton nouveau */}
        <div className="flex items-center justify-between px-2 mb-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Documents
          </span>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-6 h-6 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title="Nouveau document"
          >
            <FilePlus size={13} />
          </button>
        </div>

        {/* États */}
        {loading && (
          <div className="space-y-1.5 px-1">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        )}

        {!loading && documents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center px-2">
            <FileText size={24} className="text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">
              Aucun document
            </p>
            <p className="text-[11px] text-muted-foreground/60">
              Uploadez votre premier PDF
            </p>
          </div>
        )}

        {!loading && documents.map((doc) => (
          <DocumentItem
            key={doc.id}
            document={doc}
            isActive={doc.id === activeId}
            onSelect={() => router.push(`/dashboard/${doc.id}`)}
            onDelete={fetchDocuments}
          />
        ))}
      </div>

      {/* User footer */}
      <div className="border-t border-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted/60 transition-colors group">
              <Avatar className="w-7 h-7 shrink-0">
                <AvatarFallback className="text-[11px] bg-primary/10 text-primary font-bold">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-semibold truncate">{user.name ?? "User"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
              <ChevronDown size={13} className="text-muted-foreground shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={handleSignOut} // 🎯 Changement vers la nouvelle fonction
            >
              <LogOut size={13} className="mr-2" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

    </aside>
  )
}