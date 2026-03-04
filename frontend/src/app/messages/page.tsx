'use client'

import { useState, useEffect, useCallback } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuth } from '@/lib/auth'
import { Channel, Conversation, Message, MessageAttachment } from '@/types'
import {
  getChannels,
  getChannel,
  getUserConversations,
  getConversation,
  getChannelMessages,
  getConversationMessages,
  sendMessage,
  hasPermission,
  seedMessagingData,
  markAsRead,
  getTeamMemberName,
  getUserRole,
  addReaction,
  getMessageById,
} from '@/lib/messaging-storage'
import { ChannelSidebar } from '@/components/messaging/channel-sidebar'
import { MessageThread } from '@/components/messaging/message-thread'
import { MessageInput } from '@/components/messaging/message-input'
import { MessageSearchBar } from '@/components/messaging/message-search-bar'
import { ChannelMembersPanel } from '@/components/messaging/channel-members-panel'
import { RoleManagementDialog } from '@/components/messaging/role-management-dialog'
import { Button } from '@/components/ui/button'
import { Hash, Lock, Users, Settings, PanelRight, MessageSquare, Search, Reply, X } from 'lucide-react'

export default function MessagesPage() {
  const { user } = useAuth()
  const [channels, setChannels] = useState<Channel[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activeChannelId, setActiveChannelId] = useState<number | undefined>()
  const [activeConversationId, setActiveConversationId] = useState<number | undefined>()
  const [showMembers, setShowMembers] = useState(true)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const currentUserId = user?.id || ''

  // Seed data on first mount
  useEffect(() => {
    seedMessagingData()
  }, [])

  // Keyboard shortcut: Cmd/Ctrl+F to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault()
        setShowSearch(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const loadData = useCallback(() => {
    const allChannels = getChannels().filter(c => c.member_ids.includes(currentUserId))
    setChannels(allChannels)
    setConversations(getUserConversations(currentUserId))
  }, [currentUserId])

  useEffect(() => {
    if (!currentUserId) return
    loadData()
    // Auto-select General channel
    const allChannels = getChannels().filter(c => c.member_ids.includes(currentUserId))
    if (allChannels.length > 0 && !activeChannelId && !activeConversationId) {
      setActiveChannelId(allChannels[0].id)
    }
  }, [currentUserId, loadData]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load messages when active selection changes
  useEffect(() => {
    if (activeChannelId) {
      setMessages(getChannelMessages(activeChannelId))
      markAsRead(currentUserId, 'channel', activeChannelId)
    } else if (activeConversationId) {
      setMessages(getConversationMessages(activeConversationId))
      markAsRead(currentUserId, 'conv', activeConversationId)
    } else {
      setMessages([])
    }
  }, [activeChannelId, activeConversationId, currentUserId])

  // Listen for messaging changes
  useEffect(() => {
    const handler = () => loadData()
    window.addEventListener('messaging-changed', handler)
    return () => window.removeEventListener('messaging-changed', handler)
  }, [loadData])

  const handleSelectChannel = (channelId: number) => {
    setActiveChannelId(channelId)
    setActiveConversationId(undefined)
  }

  const handleSelectConversation = (conversationId: number) => {
    setActiveConversationId(conversationId)
    setActiveChannelId(undefined)
  }

  const refreshMessages = useCallback(() => {
    if (activeChannelId) {
      setMessages(getChannelMessages(activeChannelId))
    } else if (activeConversationId) {
      setMessages(getConversationMessages(activeConversationId))
    }
  }, [activeChannelId, activeConversationId])

  const handleSendMessage = (content: string, attachments?: MessageAttachment[]) => {
    if (!user) return
    sendMessage({
      channel_id: activeChannelId,
      conversation_id: activeConversationId,
      sender_id: user.id,
      sender_name: user.name,
      content,
      attachments,
      reply_to_id: replyToMessage?.id,
    })
    setReplyToMessage(null)
    refreshMessages()
  }

  const handleReact = (messageId: number, emoji: string) => {
    const userId = user?.id ?? 'anonymous'
    addReaction(messageId, emoji, userId)
    refreshMessages()
  }

  const handleReply = (message: Message) => {
    setReplyToMessage(message)
  }

  // Build a lookup map for reply-to messages
  const replyToMessages: Record<number, Message> = {}
  for (const msg of messages) {
    if (msg.reply_to_id) {
      const parent = getMessageById(msg.reply_to_id)
      if (parent) {
        replyToMessages[msg.reply_to_id] = parent
      }
    }
  }

  const activeChannel = activeChannelId ? getChannel(activeChannelId) : null
  const activeConversation = activeConversationId ? getConversation(activeConversationId) : null

  const canCreateChannels = hasPermission(currentUserId, 'can_create_channels')
  const canManageMembers = hasPermission(currentUserId, 'can_manage_members')
  const canDeleteMessages = hasPermission(currentUserId, 'can_delete_messages')
  const isSuperAdmin = getUserRole(currentUserId) === 'super_admin'

  // Build header for active view
  const getHeaderInfo = () => {
    if (activeChannel) {
      return {
        icon: activeChannel.is_private ? <Lock className="h-5 w-5" /> : <Hash className="h-5 w-5" />,
        title: activeChannel.name,
        subtitle: activeChannel.description,
        memberCount: activeChannel.member_ids.length,
        isChannel: true,
      }
    }
    if (activeConversation) {
      const otherNames = activeConversation.participant_ids
        .filter(id => id !== currentUserId)
        .map(id => getTeamMemberName(id))
      return {
        icon: activeConversation.type === 'group_dm' ? <Users className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />,
        title: activeConversation.name || otherNames.join(', '),
        subtitle: activeConversation.type === 'group_dm' ? `${activeConversation.participant_ids.length} members` : '',
        memberCount: activeConversation.participant_ids.length,
        isChannel: false,
      }
    }
    return null
  }

  const headerInfo = getHeaderInfo()

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-var(--header-height)-2rem)] mx-4 border rounded-lg overflow-hidden bg-background">
        {/* Left Sidebar */}
        <ChannelSidebar
          channels={channels}
          conversations={conversations}
          currentUserId={currentUserId}
          canCreateChannels={canCreateChannels}
          activeChannelId={activeChannelId}
          activeConversationId={activeConversationId}
          onSelectChannel={handleSelectChannel}
          onSelectConversation={handleSelectConversation}
          onDataChanged={loadData}
        />

        {/* Center Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {headerInfo ? (
            <>
              {/* Channel/Conversation Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2 min-w-0">
                  {headerInfo.icon}
                  <div className="min-w-0">
                    <h2 className="font-semibold text-sm truncate">{headerInfo.title}</h2>
                    {headerInfo.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">{headerInfo.subtitle}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {/* Search toggle button */}
                  <Button
                    size="icon"
                    variant={showSearch ? 'secondary' : 'ghost'}
                    className="h-8 w-8"
                    onClick={() => setShowSearch((prev) => !prev)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                  {isSuperAdmin && (
                    <Button size="sm" variant="ghost" onClick={() => setRoleDialogOpen(true)} className="gap-1.5">
                      <Settings className="h-4 w-4" />
                      <span className="hidden sm:inline">Manage Roles</span>
                    </Button>
                  )}
                  {headerInfo.isChannel && (
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setShowMembers(!showMembers)}>
                      <PanelRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Search bar */}
              {showSearch && (
                <MessageSearchBar
                  onSearch={setSearchTerm}
                  onClose={() => { setShowSearch(false); setSearchTerm('') }}
                />
              )}

              {/* Messages + Members */}
              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 flex flex-col min-w-0">
                  <MessageThread
                    messages={messages}
                    currentUserId={currentUserId}
                    canDeleteMessages={canDeleteMessages}
                    onMessageUpdated={refreshMessages}
                    onReply={handleReply}
                    onReact={handleReact}
                    replyToMessages={replyToMessages}
                    searchTerm={searchTerm}
                  />

                  {/* Reply bar */}
                  {replyToMessage && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 border-t text-sm">
                      <Reply className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">Replying to</span>
                      <span className="font-medium">{replyToMessage.sender_name}</span>
                      <span className="text-muted-foreground truncate flex-1">
                        {replyToMessage.content.slice(0, 60)}…
                      </span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setReplyToMessage(null)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  <MessageInput
                    onSend={handleSendMessage}
                    placeholder={activeChannel ? `Message #${activeChannel.name}` : 'Type a message...'}
                  />
                </div>
                {headerInfo.isChannel && showMembers && activeChannel && (
                  <ChannelMembersPanel
                    channel={activeChannel}
                    currentUserId={currentUserId}
                    canManageMembers={canManageMembers}
                    onMembersChanged={() => { loadData(); refreshMessages() }}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-2">
                <MessageSquare className="h-12 w-12 mx-auto opacity-30" />
                <p className="text-sm">Select a channel or conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <RoleManagementDialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen} />
    </MainLayout>
  )
}
