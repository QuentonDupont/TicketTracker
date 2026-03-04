'use client'

import { useEffect, useRef } from 'react'
import { Message } from '@/types'
import { MessageBubble } from './message-bubble'

interface MessageThreadProps {
  messages: Message[]
  currentUserId: string
  canDeleteMessages: boolean
  onMessageUpdated: () => void
  onReply?: (message: Message) => void
  onReact?: (messageId: number, emoji: string) => void
  replyToMessages?: Record<number, Message>
  searchTerm?: string
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export function MessageThread({
  messages,
  currentUserId,
  canDeleteMessages,
  onMessageUpdated,
  onReply,
  onReact,
  replyToMessages,
  searchTerm,
}: MessageThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const displayMessages = searchTerm
    ? messages.filter(m => m.content.toLowerCase().includes(searchTerm.toLowerCase()))
    : messages

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p className="text-sm">No messages yet. Start the conversation!</p>
      </div>
    )
  }

  if (displayMessages.length === 0 && searchTerm) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p className="text-sm">No messages match &quot;{searchTerm}&quot;</p>
      </div>
    )
  }

  // Group messages by date and by sender
  let lastDate = ''

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto py-4">
      {displayMessages.map((message, index) => {
        const messageDate = new Date(message.created_date).toDateString()
        const showDateSeparator = messageDate !== lastDate
        lastDate = messageDate

        const actualShowAvatar = message.sender_id !== displayMessages[index - 1]?.sender_id ||
          showDateSeparator ||
          (index > 0 && new Date(message.created_date).getTime() - new Date(displayMessages[index - 1].created_date).getTime() > 5 * 60 * 1000)

        const replyToMessage = message.reply_to_id ? replyToMessages?.[message.reply_to_id] ?? null : null

        return (
          <div key={message.id}>
            {showDateSeparator && (
              <div className="flex items-center gap-4 px-4 py-3">
                <div className="flex-1 border-t" />
                <span className="text-xs text-muted-foreground font-medium">{formatDateSeparator(message.created_date)}</span>
                <div className="flex-1 border-t" />
              </div>
            )}
            <MessageBubble
              message={message}
              currentUserId={currentUserId}
              canDelete={canDeleteMessages}
              showAvatar={actualShowAvatar}
              onMessageUpdated={onMessageUpdated}
              onReply={onReply}
              onReact={onReact}
              replyToMessage={replyToMessage}
              highlightTerm={searchTerm}
            />
          </div>
        )
      })}
    </div>
  )
}
