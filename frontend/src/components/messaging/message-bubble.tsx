'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Message } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, Check, X, Reply } from 'lucide-react'
import { editMessage, deleteMessage } from '@/lib/messaging-storage'
import { getUserProfile } from '@/lib/user-profiles'
import { UserProfileSheet } from '@/components/user-profile-sheet'
import { CodeSnippetCard } from './code-snippet-card'
import { FileAttachmentCard } from './file-attachment-card'
import { MessageReactions, QuickEmojiPicker } from './message-reactions'

interface MessageBubbleProps {
  message: Message
  currentUserId: string
  canDelete: boolean
  showAvatar: boolean
  onMessageUpdated: () => void
  onReply?: (message: Message) => void
  onReact?: (messageId: number, emoji: string) => void
  replyToMessage?: Message | null
  highlightTerm?: string
}

function highlightText(text: string, term: string): React.ReactNode {
  if (!term) return text
  const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === term.toLowerCase()
      ? <mark key={i} className="bg-yellow-300/40 text-inherit rounded px-0.5">{part}</mark>
      : part
  )
}

function renderContent(text: string, term?: string): React.ReactNode {
  // Split on ticket references like #123
  const ticketParts = text.split(/(#\d+)/g)
  const nodes: React.ReactNode[] = []

  ticketParts.forEach((segment, idx) => {
    const ticketMatch = segment.match(/^#(\d+)$/)
    if (ticketMatch) {
      const n = ticketMatch[1]
      nodes.push(
        <Link
          key={idx}
          href={`/tickets/${n}`}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs font-mono hover:bg-blue-500/30 transition-colors"
        >
          # {n}
        </Link>
      )
    } else if (segment.length > 0) {
      nodes.push(term ? highlightText(segment, term) : segment)
    }
  })

  return nodes
}

export function MessageBubble({
  message,
  currentUserId,
  canDelete,
  showAvatar,
  onMessageUpdated,
  onReply,
  onReact,
  replyToMessage,
  highlightTerm,
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [isHovered, setIsHovered] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const isOwn = message.sender_id === currentUserId
  const initials = message.sender_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const senderProfile = getUserProfile(message.sender_id)
  const senderAvatar = senderProfile?.avatar

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      editMessage(message.id, editContent.trim())
      onMessageUpdated()
    }
    setIsEditing(false)
  }

  const handleDelete = () => {
    deleteMessage(message.id)
    onMessageUpdated()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSaveEdit()
    }
    if (e.key === 'Escape') {
      setIsEditing(false)
      setEditContent(message.content)
    }
  }

  const formattedTime = new Date(message.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const showActions = isHovered && !isEditing && (isOwn || canDelete || onReply)

  return (
    <div
      className="group flex gap-3 px-4 py-1 hover:bg-muted/30 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-9 flex-shrink-0">
        {showAvatar && (
          <button onClick={() => setProfileOpen(true)} className="rounded-full focus:outline-none">
            <Avatar className={`h-9 w-9 transition-all duration-200 cursor-pointer ${
              senderAvatar ? 'ring-2 ring-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.35)] hover:shadow-[0_0_16px_rgba(59,130,246,0.55)]' : 'hover:ring-2 hover:ring-white/20'
            }`}>
              {senderAvatar && <AvatarImage src={senderAvatar} alt={message.sender_name} className="object-cover" />}
              <AvatarFallback className="text-xs bg-primary/20 text-primary">{initials}</AvatarFallback>
            </Avatar>
          </button>
        )}
      </div>
      <div className="flex-1 min-w-0">
        {showAvatar && (
          <div className="flex items-baseline gap-2">
            <button onClick={() => setProfileOpen(true)} className="font-semibold text-sm hover:underline cursor-pointer">
              {message.sender_name}
            </button>
            <span className="text-xs text-muted-foreground">{formattedTime}</span>
          </div>
        )}

        {/* Reply-to preview */}
        {replyToMessage && (
          <div className="mb-2 pl-3 border-l-2 border-muted-foreground/40 text-xs text-muted-foreground">
            <span className="font-medium">{replyToMessage.sender_name}</span>
            <span className="ml-1 truncate">
              {replyToMessage.content.slice(0, 80)}{replyToMessage.content.length > 80 ? '…' : ''}
            </span>
          </div>
        )}

        {isEditing ? (
          <div className="flex items-center gap-2 mt-1">
            <Input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 h-8 text-sm"
              autoFocus
            />
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSaveEdit}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setIsEditing(false); setEditContent(message.content) }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <p className={`text-sm whitespace-pre-wrap break-words ${!showAvatar ? 'text-muted-foreground' : ''}`}>
              {renderContent(message.content, highlightTerm)}
              {message.is_edited && (
                <span className="text-xs text-muted-foreground ml-1">(edited)</span>
              )}
            </p>
            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((att) => (
                  att.type === 'code'
                    ? <CodeSnippetCard key={att.id} attachment={att} />
                    : <FileAttachmentCard key={att.id} attachment={att} />
                ))}
              </div>
            )}
            {/* Reactions summary bar */}
            {onReact && (
              <MessageReactions
                message={message}
                currentUserId={currentUserId}
                onReact={onReact}
              />
            )}
          </>
        )}
      </div>

      {/* Hover action bar */}
      {showActions && (
        <div className="absolute right-4 top-0 flex items-center gap-0.5 bg-background border rounded-md shadow-sm px-1">
          {/* Quick emoji picker */}
          {onReact && (
            <QuickEmojiPicker messageId={message.id} onReact={onReact} />
          )}
          {/* Reply button */}
          {onReply && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onReply(message)}>
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
          {isOwn && (
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsEditing(true)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          {(isOwn || canDelete) && (
            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={handleDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}

      <UserProfileSheet
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        targetUserId={message.sender_id}
        targetUserName={message.sender_name}
      />
    </div>
  )
}
