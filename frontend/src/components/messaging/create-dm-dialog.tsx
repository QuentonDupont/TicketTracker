'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { createConversation, getOrCreateDM, getTeamMemberId, getTeamMemberName } from '@/lib/messaging-storage'
import { getTeamMembers } from '@/lib/team-storage'

interface CreateDmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUserId: string
  onConversationCreated: (conversationId: number) => void
}

export function CreateDmDialog({ open, onOpenChange, currentUserId, onConversationCreated }: CreateDmDialogProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [groupName, setGroupName] = useState('')

  const allTeamMembers = getTeamMembers()
  const allUserIds = ['user_quenton', 'user_admin', ...allTeamMembers.map(m => getTeamMemberId(m))]
    .filter(id => id !== currentUserId)

  const isGroup = selectedMembers.length > 1

  const handleCreate = () => {
    if (selectedMembers.length === 0) return

    let conversationId: number

    if (selectedMembers.length === 1) {
      // Single DM
      const conv = getOrCreateDM(currentUserId, selectedMembers[0])
      conversationId = conv.id
    } else {
      // Group DM
      const conv = createConversation(
        [currentUserId, ...selectedMembers],
        groupName.trim() || undefined
      )
      conversationId = conv.id
    }

    setSelectedMembers([])
    setGroupName('')
    onOpenChange(false)
    onConversationCreated(conversationId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Direct Message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Select members</Label>
            <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
              {allUserIds.map(userId => (
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
          </div>
          {isGroup && (
            <div>
              <Label htmlFor="group-name">Group Name (optional)</Label>
              <Input
                id="group-name"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="e.g. Project Sync"
                className="mt-1"
              />
            </div>
          )}
          <Button onClick={handleCreate} disabled={selectedMembers.length === 0} className="w-full">
            {isGroup ? 'Create Group Chat' : 'Open Conversation'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
