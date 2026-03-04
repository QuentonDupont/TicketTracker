'use client'

import { useState } from 'react'
import { Channel, Conversation } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Hash, Lock, Plus, Search, Users, Pencil } from 'lucide-react'
import { getTeamMemberName, hasUnreadInChannel, hasUnreadInConversation } from '@/lib/messaging-storage'
import { CreateChannelDialog } from './create-channel-dialog'
import { CreateDmDialog } from './create-dm-dialog'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'
}

interface ChannelSidebarProps {
  channels: Channel[]
  conversations: Conversation[]
  currentUserId: string
  canCreateChannels: boolean
  activeChannelId?: number
  activeConversationId?: number
  onSelectChannel: (channelId: number) => void
  onSelectConversation: (conversationId: number) => void
  onDataChanged: () => void
}

export function ChannelSidebar({
  channels, conversations, currentUserId, canCreateChannels,
  activeChannelId, activeConversationId,
  onSelectChannel, onSelectConversation, onDataChanged,
}: ChannelSidebarProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [createChannelOpen, setCreateChannelOpen] = useState(false)
  const [createDmOpen, setCreateDmOpen] = useState(false)

  const filteredChannels = channels.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const filteredConversations = conversations.filter(c => {
    const names = c.participant_ids
      .filter(id => id !== currentUserId)
      .map(id => getTeamMemberName(id))
      .join(', ')
    const label = c.name || names
    return label.toLowerCase().includes(search.toLowerCase())
  })

  const getConversationLabel = (conv: Conversation): string => {
    if (conv.name) return conv.name
    const otherNames = conv.participant_ids
      .filter(id => id !== currentUserId)
      .map(id => getTeamMemberName(id))
    return otherNames.join(', ')
  }

  const getConversationInitials = (conv: Conversation): string => {
    const others = conv.participant_ids.filter(id => id !== currentUserId)
    if (others.length === 1) {
      return getTeamMemberName(others[0]).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    }
    return others.length.toString()
  }

  return (
    <div className="w-64 border-r flex flex-col bg-muted/30">
      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="pl-8 h-9 bg-background"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Channels Section */}
        <div className="px-3 py-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Channels</span>
            {canCreateChannels && (
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setCreateChannelOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <div className="space-y-0.5">
            {filteredChannels.map(channel => {
              const isActive = activeChannelId === channel.id
              const hasUnread = hasUnreadInChannel(currentUserId, channel.id)
              return (
                <button
                  key={channel.id}
                  onClick={() => onSelectChannel(channel.id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left transition-colors',
                    isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground',
                    hasUnread && !isActive && 'font-semibold'
                  )}
                >
                  {channel.is_private ? <Lock className="h-3.5 w-3.5 flex-shrink-0" /> : <Hash className="h-3.5 w-3.5 flex-shrink-0" />}
                  <span className="truncate">{channel.name}</span>
                  {hasUnread && !isActive && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Direct Messages Section */}
        <div className="px-3 py-1 mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Direct Messages</span>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setCreateDmOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="space-y-0.5">
            {filteredConversations.map(conv => {
              const isActive = activeConversationId === conv.id
              const hasUnread = hasUnreadInConversation(currentUserId, conv.id)
              const label = getConversationLabel(conv)
              const initials = getConversationInitials(conv)
              const isGroup = conv.type === 'group_dm'
              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left transition-colors',
                    isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground',
                    hasUnread && !isActive && 'font-semibold'
                  )}
                >
                  {isGroup ? (
                    <div className="h-6 w-6 rounded-md bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Users className="h-3.5 w-3.5 text-primary" />
                    </div>
                  ) : (
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarFallback className="text-[10px] bg-primary/20 text-primary">{initials}</AvatarFallback>
                    </Avatar>
                  )}
                  <span className="truncate">{label}</span>
                  {hasUnread && !isActive && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </ScrollArea>

      <CreateChannelDialog
        open={createChannelOpen}
        onOpenChange={setCreateChannelOpen}
        currentUserId={currentUserId}
        onChannelCreated={onDataChanged}
      />
      <CreateDmDialog
        open={createDmOpen}
        onOpenChange={setCreateDmOpen}
        currentUserId={currentUserId}
        onConversationCreated={(id) => { onDataChanged(); onSelectConversation(id) }}
      />

      {/* User profile footer — navigates to the full /profile page */}
      {user && (
        <button
          onClick={() => router.push('/profile')}
          className="group flex items-center gap-2.5 px-3 py-2.5 border-t border-border/50 hover:bg-accent/50 transition-colors w-full text-left"
        >
          <Avatar className="h-7 w-7 flex-shrink-0">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />}
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-violet-700 text-white text-[10px] font-bold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user.name}</p>
            {user.jobTitle && (
              <p className="text-[10px] text-muted-foreground truncate">{user.jobTitle}</p>
            )}
          </div>
          <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </button>
      )}
    </div>
  )
}
