'use client'

import { useState, useRef, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Send,
  Code2,
  Paperclip,
  Smile,
  AtSign,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'
import { getRoleContext, getToolbarOrder } from '@/lib/role-context'
import { CodeSnippetModal } from './code-snippet-modal'
import { MessageAttachment } from '@/types'

// 24 common emojis shown in 6x4 grid
const COMMON_EMOJIS = [
  '😀','😂','😍','🥰','😎','🤔',
  '👍','👎','🎉','🔥','💯','❤️',
  '✅','❌','⚡','🚀','💡','🎯',
  '👋','🙏','💪','😅','🤣','😊',
]

interface MessageInputProps {
  onSend: (content: string, attachments?: MessageAttachment[]) => void
  placeholder?: string
  disabled?: boolean
}

export function MessageInput({
  onSend,
  placeholder = 'Type a message...',
  disabled = false,
}: MessageInputProps) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [pendingAttachments, setPendingAttachments] = useState<MessageAttachment[]>([])
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [codeModalKey, setCodeModalKey] = useState(0)
  const [showEmojiGrid, setShowEmojiGrid] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const roleContext = useMemo(() => getRoleContext(user?.email ?? ''), [user?.email])
  const toolbarOrder = useMemo(() => getToolbarOrder(roleContext), [roleContext])

  // -----------------------------------------------------------------------
  // Send handler
  // -----------------------------------------------------------------------
  const handleSend = () => {
    const trimmed = content.trim()
    if (!trimmed && pendingAttachments.length === 0) return
    onSend(trimmed, pendingAttachments.length > 0 ? pendingAttachments : undefined)
    setContent('')
    setPendingAttachments([])
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }

  // -----------------------------------------------------------------------
  // File handler
  // -----------------------------------------------------------------------
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const MAX_BYTES = 10 * 1024 * 1024
    if (file.size > MAX_BYTES) {
      toast.error('File too large — max 10MB')
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const att: MessageAttachment = {
        id: Date.now(),
        type: file.type.startsWith('image/') ? 'image' : 'file',
        name: file.name,
        mimeType: file.type,
        size: file.size,
        dataUrl,
      }
      setPendingAttachments((prev) => [...prev, att])
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // -----------------------------------------------------------------------
  // Emoji handler
  // -----------------------------------------------------------------------
  const handleEmojiClick = (emoji: string) => {
    setContent((prev) => prev + emoji)
    setShowEmojiGrid(false)
    textareaRef.current?.focus()
  }

  // -----------------------------------------------------------------------
  // Mention handler
  // -----------------------------------------------------------------------
  const handleMention = () => {
    setContent((prev) => prev + '@')
    textareaRef.current?.focus()
  }

  // -----------------------------------------------------------------------
  // Dismiss pending attachment
  // -----------------------------------------------------------------------
  const dismissAttachment = (id: number) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  // -----------------------------------------------------------------------
  // Toolbar button renderer
  // -----------------------------------------------------------------------
  const isEngineering = roleContext === 'engineering'
  const isMarketingOrDesign = roleContext === 'marketing' || roleContext === 'design'

  const renderToolbarButton = (tool: 'code' | 'file' | 'emoji' | 'mention') => {
    switch (tool) {
      case 'code':
        return (
          <Tooltip key="code">
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                className={[
                  'h-8 w-8 text-muted-foreground',
                  isEngineering
                    ? 'hover:text-blue-400 hover:bg-blue-500/10'
                    : 'hover:text-foreground',
                ].join(' ')}
                onClick={() => setShowCodeModal(true)}
              >
                <Code2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share Code Snippet</TooltipContent>
          </Tooltip>
        )
      case 'file':
        return (
          <Tooltip key="file">
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                className={[
                  'h-8 w-8 text-muted-foreground',
                  isMarketingOrDesign
                    ? 'hover:text-green-400 hover:bg-green-500/10'
                    : 'hover:text-foreground',
                ].join(' ')}
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Attach File</TooltipContent>
          </Tooltip>
        )
      case 'emoji':
        return (
          <Tooltip key="emoji">
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setShowEmojiGrid((p) => !p)}
              >
                <Smile className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Emoji</TooltipContent>
          </Tooltip>
        )
      case 'mention':
        return (
          <Tooltip key="mention">
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={handleMention}
              >
                <AtSign className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mention</TooltipContent>
          </Tooltip>
        )
      default:
        return null
    }
  }

  const canSend = content.trim().length > 0 || pendingAttachments.length > 0

  return (
    <div className="border-t bg-background">
      {/* Pending attachments strip */}
      {pendingAttachments.length > 0 && (
        <div className="flex items-center gap-2 px-4 pt-3 pb-1 overflow-x-auto">
          {pendingAttachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-1.5 bg-white/10 rounded-md px-2 py-1 text-xs flex-shrink-0 max-w-[180px]"
            >
              {att.type === 'code' ? (
                <span className="font-mono text-blue-400 text-[10px] font-bold">{'/>'}</span>
              ) : (
                <Paperclip className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              )}
              <span className="truncate text-muted-foreground">
                {att.type === 'code'
                  ? att.language ?? 'code'
                  : (att.name ?? 'file').slice(0, 20)}
              </span>
              <button
                type="button"
                className="ml-0.5 text-muted-foreground hover:text-foreground flex-shrink-0"
                onClick={() => dismissAttachment(att.id)}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Emoji grid (inline, above toolbar) */}
      {showEmojiGrid && (
        <div className="px-4 pt-2">
          <div className="grid grid-cols-6 gap-1 p-2 rounded-md border border-white/10 bg-black/50 w-fit">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="h-8 w-8 flex items-center justify-center rounded hover:bg-white/10 text-base transition-colors"
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar row */}
      <div className="flex items-center gap-0.5 px-4 pt-2 pb-1">
        {toolbarOrder.map((tool) => renderToolbarButton(tool))}
      </div>

      {/* Textarea + Send row */}
      <div className="flex items-end gap-2 px-4 pb-4 pt-1">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ minHeight: '38px', maxHeight: '120px' }}
        />
        <Button
          type="button"
          size="icon"
          onClick={handleSend}
          disabled={disabled || !canSend}
          className="h-[38px] w-[38px] flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".xlsx,.xls,.csv,.pdf,.docx,.doc,.pptx,.ppt,.png,.jpg,.jpeg,.gif,.webp,.zip,.txt"
        onChange={handleFileSelect}
      />

      {/* Code snippet modal */}
      <CodeSnippetModal
        key={codeModalKey}
        open={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        onAttach={(att) => {
          setPendingAttachments((prev) => [...prev, { ...att, id: Date.now() }])
          setShowCodeModal(false)
          setCodeModalKey((k) => k + 1)
        }}
      />
    </div>
  )
}
