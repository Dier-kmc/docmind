"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2 } from "lucide-react"

interface Props {
  onSend: (message: string) => void
  isLoading: boolean
  disabled?: boolean
}

export function ChatInput({ onSend, isLoading, disabled }: Props) {
  const [value, setValue] = useState("")
  const ref = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (!value.trim() || isLoading || disabled) return
    onSend(value.trim())
    setValue("")
    ref.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-end gap-2 p-4 border-t border-border bg-background">
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          disabled
            ? "Processing document • Traitement en cours..."
            : "Ask a question • Posez une question... (Enter to send • Entrée pour envoyer)"
        }
        disabled={isLoading || disabled}
        rows={1}
        className="flex-1 resize-none min-h-[44px] max-h-32 text-sm"
      />
      <Button
        onClick={handleSend}
        disabled={!value.trim() || isLoading || disabled}
        size="icon"
        className="shrink-0 h-11 w-11"
      >
        {isLoading
          ? <Loader2 size={16} className="animate-spin" />
          : <Send size={16} />
        }
      </Button>
    </div>
  )
}