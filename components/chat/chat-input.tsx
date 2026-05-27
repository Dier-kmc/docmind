"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Paperclip, Sparkles, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading?: boolean
  disabled?: boolean
}

export function ChatInput({ onSend, isLoading = false, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSend(message.trim())
      setMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [message])

  const suggestions = [
    "What is this document about?",
    "Summarize the key points",
    "Explain the main conclusions",
  ]

  return (
    <div className="border-t border-white/10 bg-gradient-to-r from-white/5 to-transparent backdrop-blur-sm p-4">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence>
          {!message && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-wrap gap-2 mb-3 justify-center"
            >
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => onSend(suggestion)}
                  className="px-3 py-1.5 rounded-full text-xs bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 hover:scale-105"
                >
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  {suggestion}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative group">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your document..."
            disabled={isLoading || disabled}
            rows={1}
            className="min-h-[56px] max-h-[200px] resize-none bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-primary/50 focus:ring-primary/50 pr-24 rounded-2xl"
          />
          
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
              disabled={isLoading || disabled}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={!message.trim() || isLoading || disabled}
              className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <p className="text-xs text-center text-zinc-500 mt-3">
          AI responses are generated based on document content • May not be 100% accurate
        </p>
      </div>
    </div>
  )
}