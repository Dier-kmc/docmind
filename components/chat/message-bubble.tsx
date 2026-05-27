"use client"

import { Message } from "@/types"
import { SourceCard } from "./source-card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  message: Message
  userName?: string | null
}

export function MessageBubble({ message, userName }: Props) {
  const isUser      = message.role === "user"
  const isEmpty     = !message.content && message.role === "assistant"

  return (
    <div className={cn(
      "flex gap-3 w-full",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>

      {/* Avatar */}
      <Avatar className="w-7 h-7 shrink-0 mt-0.5">
        <AvatarFallback className={cn(
          "text-[11px] font-bold",
          isUser
            ? "bg-primary/20 text-primary"
            : "bg-muted text-muted-foreground"
        )}>
          {isUser
            ? (userName?.charAt(0).toUpperCase() ?? <User size={12} />)
            : <Bot size={12} />
          }
        </AvatarFallback>
      </Avatar>

      {/* Bubble */}
      <div className={cn(
        "flex flex-col max-w-[78%]",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Sender label */}
        <span className="text-[10px] text-muted-foreground mb-1 px-1">
          {isUser
            ? (userName ?? "You • Vous")
            : "DocMind AI"
          }
        </span>

        {/* Content */}
        <div className={cn(
          "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted/60 text-foreground rounded-tl-sm border border-border/50"
        )}>
          {isEmpty
            ? (
              // Typing indicator
              <div className="flex items-center gap-1 py-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            )
            : message.content
          }
        </div>

        {/* Sources */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="w-full px-1 mt-1">
            <SourceCard sources={message.sources} />
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground/60 mt-1 px-1">
          {message.timestamp.toLocaleTimeString([], {
            hour:   "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  )
}