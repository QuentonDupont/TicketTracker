'use client'

import { Message } from '@/types'

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🚀', '👀', '✅']

interface QuickEmojiPickerProps {
  messageId: number
  onReact: (messageId: number, emoji: string) => void
}

export function QuickEmojiPicker({ messageId, onReact }: QuickEmojiPickerProps) {
  return (
    <div className="flex items-center gap-0.5">
      {QUICK_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          className="text-lg cursor-pointer hover:scale-125 transition-transform p-0.5"
          onClick={() => onReact(messageId, emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

interface MessageReactionsProps {
  message: Message
  currentUserId: string
  onReact: (messageId: number, emoji: string) => void
}

export function MessageReactions({ message, currentUserId, onReact }: MessageReactionsProps) {
  const reactions = message.reactions

  if (!reactions || reactions.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {reactions.map((reaction) => {
        const hasReacted = reaction.user_ids.includes(currentUserId)
        return (
          <button
            key={reaction.emoji}
            type="button"
            onClick={() => onReact(message.id, reaction.emoji)}
            className={[
              'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-sm border transition-colors',
              hasReacted
                ? 'ring-1 ring-primary/60 bg-primary/10 border-primary/30 text-foreground'
                : 'bg-muted/40 border-muted-foreground/20 text-muted-foreground hover:bg-muted/60',
            ].join(' ')}
          >
            <span>{reaction.emoji}</span>
            <span className="text-xs font-medium">{reaction.user_ids.length}</span>
          </button>
        )
      })}
    </div>
  )
}
