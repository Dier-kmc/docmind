"use client"

import { motion } from "framer-motion"
import { User, Bot, Copy, CheckCheck, ThumbsUp, ThumbsDown } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SourceCard } from "./source-card"
import type { Message } from "@/types"

interface MessageBubbleProps {
  message: Message
  isLatest?: boolean
}

export function MessageBubble({ message, isLatest = false }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === "user"

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 ${isUser ? "order-2" : "order-1"}`}>
        <div className={`
          w-8 h-8 rounded-xl flex items-center justify-center
          ${isUser 
            ? "bg-gradient-to-br from-primary to-primary/80" 
            : "bg-gradient-to-br from-purple-500 to-pink-500"
          }
        `}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>
      </div>

      {/* Message content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? "order-1" : "order-2"}`}>
        <div className={`
          rounded-2xl px-4 py-3
          ${isUser 
            ? "bg-gradient-to-r from-primary to-primary/80 text-white" 
            : "bg-white/5 border border-white/10 text-zinc-200"
          }
        `}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* Sources for assistant messages */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Sources ({message.sources.length})
            </p>
            <div className="space-y-2">
              {message.sources.map((source, i) => (
                <SourceCard key={i} source={source} />
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-xs text-zinc-500 hover:text-zinc-300"
          >
            {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span className="ml-1">{copied ? "Copied!" : "Copy"}</span>
          </Button>
          
          {!isUser && (
            <>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-zinc-500">
                <ThumbsUp className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-zinc-500">
                <ThumbsDown className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
