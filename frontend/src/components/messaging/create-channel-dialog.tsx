'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { createChannel, getTeamMemberId, getTeamMemberName } from '@/lib/messaging-storage'
import { getTeamMembers } from '@/lib/team-storage'

interface CreateChannelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUserId: string
  onChannelCreated: () => void
}

export function CreateChannelDialog({ open, onOpenChange, currentUserId, onChannelCreated }: CreateChannelDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  const allTeamMembers = getTeamMembers()
  const allUserIds = ['user_quenton', 'user_admin', ...allTeamMembers.map(m => getTeamMemberId(m))]
    .filter(id => id !== currentUserId)

  const handleCreate = () => {
    if (!name.trim()) return
    const memberIds = [currentUserId, ...selectedMembers]
    createChannel({
      name: name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: description.trim(),
      is_private: isPrivate,
      member_ids: isPrivate ? memberIds : [...new Set([...allUserIds, currentUserId])],
      created_by: currentUserId,
    })
    setName('')
    setDescription('')
    setIsPrivate(false)
    setSelectedMembers([])
    onOpenChange(false)
    onChannelCreated()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="channel-name">Channel Name</Label>
            <Input
              id="channel-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. design-reviews"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="channel-desc">Description</Label>
            <Input
              id="channel-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's this channel about?"
              className="mt-1"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Private Channel</Label>
              <p className="text-xs text-muted-foreground">Only invited members can see this channel</p>
            </div>
            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
          </div>
          {isPrivate && (
            <div>
              <Label>Members</Label>
              <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
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
          )}
          <Button onClick={handleCreate} disabled={!name.trim()} className="w-full">
            Create Channel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
