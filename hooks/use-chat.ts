"use client"

import { useState, useCallback } from "react"
import { Message, Source } from "@/types"

interface UseChatOptions {
  documentId: string
}

export function useChat({ documentId }: UseChatOptions) {
  const [messages,   setMessages]   = useState<Message[]>([])
  const [isLoading,  setIsLoading]  = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    // Ajoute le message user immédiatement
    const userMessage: Message = {
      id:        crypto.randomUUID(),
      role:      "user",
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setIsSearching(true)

    // Placeholder assistant pendant la recherche
    const assistantId = crypto.randomUUID()
    const placeholder: Message = {
      id:        assistantId,
      role:      "assistant",
      content:   "",
      sources:   [],
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, placeholder])

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          messages: [...messages, userMessage].map((m) => ({
            role:    m.role,
            content: m.content,
          })),
        }),
      })

      if (!res.ok) throw new Error("Chat request failed")

      setIsSearching(false)

      // Lit le stream
      const reader  = res.body?.getReader()
      const decoder = new TextDecoder()
      let   fullText = ""
      let   sources: Source[] = []

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n").filter(Boolean)

        for (const line of lines) {
          // Sources envoyées en début de stream comme JSON
          if (line.startsWith("__SOURCES__:")) {
            try {
              sources = JSON.parse(line.replace("__SOURCES__:", ""))
            } catch {}
            continue
          }
          // Texte streamé
          if (line.startsWith("data: ")) {
            const text = line.replace("data: ", "")
            if (text === "[DONE]") break
            fullText += text
            // Met à jour le message en temps réel
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: fullText, sources }
                  : m,
              ),
            )
          }
        }
      }

    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  "An error occurred • Une erreur est survenue. Please try again • Veuillez réessayer.",
              }
            : m,
        ),
      )
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }, [documentId, messages, isLoading])

  const clearMessages = useCallback(() => setMessages([]), [])

  return {
    messages,
    isLoading,
    isSearching,
    sendMessage,
    clearMessages,
  }
}