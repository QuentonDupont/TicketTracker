'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Shield, Users, Settings } from 'lucide-react'
import { UserRole, RolePermissions } from '@/types'
import {
  getAllUserRoles,
  setUserRole,
  getAllRolePermissions,
  setRolePermissions,
  getTeamMemberId,
  getTeamMemberName,
  getUserRole,
  seedMessagingData,
} from '@/lib/messaging-storage'
import { getTeamMembers } from '@/lib/team-storage'
import { toast } from 'sonner'

const PERMISSION_LABELS: Record<keyof RolePermissions, { label: string; description: string }> = {
  can_create_channels: { label: 'Create Channels', description: 'Create new public and private channels' },
  can_manage_members: { label: 'Manage Members', description: 'Add or remove members from channels' },
  can_delete_messages: { label: 'Delete Messages', description: 'Delete messages from other users' },
  can_manage_roles: { label: 'Manage Roles', description: 'Assign roles and configure permissions' },
}

const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'bg-red-500/10 text-red-500 border-red-500/20',
  admin: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  member: 'bg-green-500/10 text-green-500 border-green-500/20',
}

export default function MessagesAdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [userRoles, setUserRolesState] = useState<Record<string, UserRole>>({})
  const [rolePerms, setRolePermsState] = useState<Record<UserRole, RolePermissions>>({} as Record<UserRole, RolePermissions>)

  useEffect(() => {
    seedMessagingData()
    setUserRolesState(getAllUserRoles())
    setRolePermsState(getAllRolePermissions())
  }, [])

  // Redirect non-super-admins
  useEffect(() => {
    if (user && getUserRole(user.id) !== 'super_admin') {
      router.push('/messages')
    }
  }, [user, router])

  const allTeamMembers = getTeamMembers()
  const allUserIds = ['user_quenton', 'user_admin', ...allTeamMembers.map(m => getTeamMemberId(m))]

  const handleRoleChange = (userId: string, role: UserRole) => {
    setUserRole(userId, role)
    setUserRolesState(prev => ({ ...prev, [userId]: role }))
    toast.success(`Role updated for ${getTeamMemberName(userId)}`)
  }

  const handlePermissionChange = (role: UserRole, permission: keyof RolePermissions, value: boolean) => {
    const updated = { ...rolePerms[role], [permission]: value }
    setRolePermissions(role, updated)
    setRolePermsState(prev => ({ ...prev, [role]: updated }))
    toast.success('Permission updated')
  }

  const roleCounts = allUserIds.reduce((acc, userId) => {
    const role = userRoles[userId] || getUserRole(userId)
    acc[role] = (acc[role] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <MainLayout>
      <div className="space-y-6 px-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/messages')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Role Management</h1>
            <p className="text-muted-foreground">Manage user roles and permissions for the messaging system</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {(['super_admin', 'admin', 'member'] as const).map(role => (
            <Card key={role}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${role === 'super_admin' ? 'bg-red-500/10' : role === 'admin' ? 'bg-blue-500/10' : 'bg-green-500/10'}`}>
                    {role === 'super_admin' ? <Shield className="h-5 w-5 text-red-500" /> :
                     role === 'admin' ? <Settings className="h-5 w-5 text-blue-500" /> :
                     <Users className="h-5 w-5 text-green-500" />}
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{roleCounts[role] || 0}</p>
                    <p className="text-sm text-muted-foreground capitalize">{role.replace('_', ' ')}s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Roles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> User Roles</CardTitle>
              <CardDescription>Assign roles to team members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {allUserIds.map(userId => {
                const name = getTeamMemberName(userId)
                const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                const role = userRoles[userId] || getUserRole(userId)
                return (
                  <div key={userId} className="flex items-center gap-3 p-3 rounded-lg border">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs bg-primary/20 text-primary">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{name}</p>
                      <Badge variant="outline" className={`text-[10px] ${ROLE_COLORS[role]}`}>
                        {role.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Select
                      value={role}
                      onValueChange={(val: UserRole) => handleRoleChange(userId, val)}
                    >
                      <SelectTrigger className="w-32 h-8">
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
            </CardContent>
          </Card>

          {/* Role Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Role Permissions</CardTitle>
              <CardDescription>Configure what each role can do</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {(['admin', 'member'] as const).map(role => (
                <div key={role} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={ROLE_COLORS[role]}>
                      {role.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="space-y-3 pl-1">
                    {(Object.keys(PERMISSION_LABELS) as Array<keyof RolePermissions>).map(perm => (
                      <label key={perm} className="flex items-start gap-3 cursor-pointer">
                        <Checkbox
                          checked={rolePerms[role]?.[perm] ?? false}
                          onCheckedChange={(checked) => handlePermissionChange(role, perm, !!checked)}
                          disabled={perm === 'can_manage_roles' && role === 'member'}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-medium">{PERMISSION_LABELS[perm].label}</p>
                          <p className="text-xs text-muted-foreground">{PERMISSION_LABELS[perm].description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {role === 'admin' && <Separator />}
                </div>
              ))}
              <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                Super Admin always has all permissions and cannot be restricted.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
