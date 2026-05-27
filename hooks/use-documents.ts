"use client"

import { useEffect, useState, useCallback } from "react"
import { Document } from "@/types"

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading,   setLoading]   = useState(true)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch("/api/documents")
      const data = await res.json()
      setDocuments(data.documents ?? [])
    } catch {
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch_() }, [fetch_])

  return { documents, loading, refetch: fetch_ }
}