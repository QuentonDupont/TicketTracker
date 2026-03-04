'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { UserRole, RolePermissions } from '@/types'
import {
  getAllUserRoles,
  setUserRole,
  getAllRolePermissions,
  setRolePermissions,
  getTeamMemberId,
  getTeamMemberName,
  getUserRole,
} from '@/lib/messaging-storage'
import { getTeamMembers } from '@/lib/team-storage'
import { toast } from 'sonner'

interface RoleManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PERMISSION_LABELS: Record<keyof RolePermissions, string> = {
  can_create_channels: 'Create Channels',
  can_manage_members: 'Manage Channel Members',
  can_delete_messages: 'Delete Others\' Messages',
  can_manage_roles: 'Manage Roles',
}

export function RoleManagementDialog({ open, onOpenChange }: RoleManagementDialogProps) {
  const [userRoles, setUserRoles] = useState<Record<string, UserRole>>({})
  const [rolePerms, setRolePerms] = useState<Record<UserRole, RolePermissions>>({} as Record<UserRole, RolePermissions>)

  useEffect(() => {
    if (open) {
      setUserRoles(getAllUserRoles())
      setRolePerms(getAllRolePermissions())
    }
  }, [open])

  const allTeamMembers = getTeamMembers()
  const allUserIds = ['user_quenton', 'user_admin', ...allTeamMembers.map(m => getTeamMemberId(m))]

  const handleRoleChange = (userId: string, role: UserRole) => {
    setUserRole(userId, role)
    setUserRoles(prev => ({ ...prev, [userId]: role }))
    toast.success(`Role updated for ${getTeamMemberName(userId)}`)
  }

  const handlePermissionChange = (role: UserRole, permission: keyof RolePermissions, value: boolean) => {
    const updated = { ...rolePerms[role], [permission]: value }
    setRolePermissions(role, updated)
    setRolePerms(prev => ({ ...prev, [role]: updated }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Role & Permission Management</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="users">
          <TabsList className="w-full">
            <TabsTrigger value="users" className="flex-1">User Roles</TabsTrigger>
            <TabsTrigger value="permissions" className="flex-1">Role Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-3 mt-4">
            <p className="text-sm text-muted-foreground">Assign roles to team members. Super admins have all permissions.</p>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {allUserIds.map(userId => {
                const name = getTeamMemberName(userId)
                const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                const role = userRoles[userId] || getUserRole(userId)
                return (
                  <div key={userId} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/20 text-primary">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm flex-1">{name}</span>
                    <Select
                      value={role}
                      onValueChange={(val: UserRole) => handleRoleChange(userId, val)}
                    >
                      <SelectTrigger className="w-36 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">Configure what each role can do. Super admin always has all permissions.</p>
            {(['admin', 'member'] as const).map(role => (
              <div key={role} className="space-y-3">
                <h4 className="font-semibold text-sm capitalize">{role}</h4>
                <div className="space-y-2 pl-2">
                  {(Object.keys(PERMISSION_LABELS) as Array<keyof RolePermissions>).map(perm => (
                    <label key={perm} className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={rolePerms[role]?.[perm] ?? false}
                        onCheckedChange={(checked) => handlePermissionChange(role, perm, !!checked)}
                        disabled={perm === 'can_manage_roles' && role === 'member'}
                      />
                      <span className="text-sm">{PERMISSION_LABELS[perm]}</span>
                    </label>
                  ))}
                </div>
                {role === 'admin' && <Separator />}
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
