"use client"

import { useEffect, useRef } from "react"
import { useChat } from "@/hooks/use-chat"
import { MessageBubble } from "./message-bubble"
import { ChatInput } from "./chat-input"
import { SearchIndicator } from "./search-indicator"
import { Document } from "@/types"
import { MessageSquare } from "lucide-react"

interface Props {
  document: Document
  userName?: string | null
}

export function ChatInterface({ document, userName }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, isLoading, isSearching, sendMessage } = useChat({
    documentId: document.id,
  })

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isSearching])

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <MessageSquare size={15} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{document.name}</p>
          <p className="text-[11px] text-muted-foreground">
            {document.chunk_count} chunks · {document.file_type.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 scrollbar-none">

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <MessageSquare size={24} className="text-muted-foreground/50" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                Ask anything • Posez n'importe quelle question
              </p>
              <p className="text-xs text-muted-foreground max-w-xs">
                DocMind will search through your document and answer with exact sources •
                DocMind cherchera dans votre document et répondra avec les sources exactes
              </p>
            </div>
            {/* Suggestion pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {[
                "Summarize this document • Résumez ce document",
                "What are the key points? • Quels sont les points clés ?",
                "What is the conclusion? • Quelle est la conclusion ?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion.split(" • ")[0])}
                  className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted/60 hover:border-primary/40 text-muted-foreground hover:text-foreground transition-all"
                >
                  {suggestion.split(" • ")[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages list */}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            userName={userName}
          />
        ))}

        {/* Searching indicator */}
        {isSearching && (
          <div className="flex justify-start">
            <SearchIndicator />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        isLoading={isLoading}
      />
    </div>
  )
}