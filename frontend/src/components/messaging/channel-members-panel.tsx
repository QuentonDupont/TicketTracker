'use client'

import { useState } from 'react'
import { Channel } from '@/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { UserPlus, X } from 'lucide-react'
import { getTeamMemberName, addChannelMember, removeChannelMember } from '@/lib/messaging-storage'
import { getTeamMembers } from '@/lib/team-storage'
import { getTeamMemberId } from '@/lib/messaging-storage'

interface ChannelMembersPanelProps {
  channel: Channel
  currentUserId: string
  canManageMembers: boolean
  onMembersChanged: () => void
}

export function ChannelMembersPanel({ channel, currentUserId, canManageMembers, onMembersChanged }: ChannelMembersPanelProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  const allTeamMembers = getTeamMembers()
  const allUserIds = ['user_quenton', 'user_admin', ...allTeamMembers.map(m => getTeamMemberId(m))]
  const nonMembers = allUserIds.filter(id => !channel.member_ids.includes(id))

  const handleAddMembers = () => {
    selectedMembers.forEach(userId => {
      addChannelMember(channel.id, userId)
    })
    setSelectedMembers([])
    setAddDialogOpen(false)
    onMembersChanged()
  }

  const handleRemoveMember = (userId: string) => {
    if (userId === channel.created_by) return // Can't remove creator
    removeChannelMember(channel.id, userId)
    onMembersChanged()
  }

  return (
    <div className="w-56 border-l flex flex-col bg-background">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="text-sm font-semibold">Members ({channel.member_ids.length})</h3>
        {canManageMembers && nonMembers.length > 0 && (
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7">
                <UserPlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Members to #{channel.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {nonMembers.map(userId => (
                  <label key={userId} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer">
                    <Checkbox
                      checked={selectedMembers.includes(userId)}
                      onCheckedChange={(checked) => {
                        setSelectedMembers(prev =>
                          checked ? [...prev, userId] : prev.filter(id => id !== userId)
                        )
                      }}
                    />
                    <span className="text-sm">{getTeamMemberName(userId)}</span>
                  </label>
                ))}
              </div>
              <Button onClick={handleAddMembers} disabled={selectedMembers.length === 0}>
                Add {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''}
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {channel.member_ids.map(userId => {
            const name = getTeamMemberName(userId)
            const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            return (
              <div key={userId} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted group">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-[10px] bg-primary/20 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm flex-1 truncate">{name}</span>
                {canManageMembers && userId !== channel.created_by && userId !== currentUserId && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={() => handleRemoveMember(userId)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
