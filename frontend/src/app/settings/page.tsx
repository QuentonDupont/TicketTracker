"use client"

import { useState, useEffect } from 'react'
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { UserSettings, AppExportData } from "@/types"
import { Settings, User, Palette, Database, Download, Upload, Trash2, Save } from "lucide-react"

const DEFAULT_SETTINGS: UserSettings = {
  theme_default: 'system',
  notifications_enabled: true,
  notification_types: {
    ticket_updates: true,
    mentions: true,
    due_date_reminders: true,
  },
  display_name: '',
  email: '',
}

function getSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const data = localStorage.getItem('user_settings')
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS
  } catch { return DEFAULT_SETTINGS }
}

function saveSettings(settings: UserSettings): void {
  localStorage.setItem('user_settings', JSON.stringify(settings))
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    const s = getSettings()
    setSettings(s)
    setDisplayName(s.display_name || user?.name || '')
    setEmail(s.email || user?.email || '')
  }, [user])

  const handleSaveProfile = () => {
    const updated = { ...settings, display_name: displayName, email }
    setSettings(updated)
    saveSettings(updated)

    // Update user_data in localStorage
    const userData = localStorage.getItem('user_data')
    if (userData) {
      const parsed = JSON.parse(userData)
      parsed.name = displayName
      parsed.email = email
      localStorage.setItem('user_data', JSON.stringify(parsed))
    }

    toast.success('Profile updated successfully')
  }

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    // Mock password change
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    toast.success('Password updated successfully')
  }

  const handleSavePreferences = () => {
    saveSettings(settings)
    setTheme(settings.theme_default)
    toast.success('Preferences saved')
  }

  const handleExportAll = () => {
    const exportData: AppExportData = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      tickets: JSON.parse(localStorage.getItem('tickets') || '[]'),
      epics: JSON.parse(localStorage.getItem('epics') || '[]'),
      project_spaces: JSON.parse(localStorage.getItem('project_spaces') || '[]'),
      team_members: JSON.parse(localStorage.getItem('team_members') || '[]'),
      ticket_links: JSON.parse(localStorage.getItem('ticket_links') || '[]'),
      custom_fields: JSON.parse(localStorage.getItem('team_custom_fields') || '[]'),
      activities: JSON.parse(localStorage.getItem('ticket_activities') || '[]'),
      comments: JSON.parse(localStorage.getItem('ticket_comments') || '[]'),
      documents: JSON.parse(localStorage.getItem('documents') || '[]'),
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tickettracker-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Data exported successfully')
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data: AppExportData = JSON.parse(e.target?.result as string)
        if (!data.version) {
          toast.error('Invalid backup file')
          return
        }
        if (data.tickets) localStorage.setItem('tickets', JSON.stringify(data.tickets))
        if (data.epics) localStorage.setItem('epics', JSON.stringify(data.epics))
        if (data.project_spaces) localStorage.setItem('project_spaces', JSON.stringify(data.project_spaces))
        if (data.team_members) localStorage.setItem('team_members', JSON.stringify(data.team_members))
        if (data.ticket_links) localStorage.setItem('ticket_links', JSON.stringify(data.ticket_links))
        if (data.custom_fields) localStorage.setItem('team_custom_fields', JSON.stringify(data.custom_fields))
        if (data.activities) localStorage.setItem('ticket_activities', JSON.stringify(data.activities))
        if (data.comments) localStorage.setItem('ticket_comments', JSON.stringify(data.comments))
        toast.success('Data imported successfully. Refresh the page to see changes.')
      } catch {
        toast.error('Failed to parse backup file')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const handleClearAll = () => {
    const keysToKeep = ['auth_token', 'user_data', 'user_settings']
    const allKeys = Object.keys(localStorage)
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key)
      }
    })
    toast.success('All project data cleared. Refresh the page to reset.')
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your profile, preferences, and data
          </p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your display name and email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input id="name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <Button onClick={handleSaveProfile}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
                <Button onClick={handleChangePassword} disabled={!currentPassword || !newPassword}>
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how TicketTracker looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={settings.theme_default} onValueChange={val => setSettings(s => ({ ...s, theme_default: val as UserSettings['theme_default'] }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive in-app notifications</p>
                  </div>
                  <Switch checked={settings.notifications_enabled} onCheckedChange={val => setSettings(s => ({ ...s, notifications_enabled: val }))} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Ticket Updates</Label>
                    <p className="text-sm text-muted-foreground">Notifications for ticket changes</p>
                  </div>
                  <Switch checked={settings.notification_types.ticket_updates} onCheckedChange={val => setSettings(s => ({ ...s, notification_types: { ...s.notification_types, ticket_updates: val } }))} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mentions</Label>
                    <p className="text-sm text-muted-foreground">When someone mentions you</p>
                  </div>
                  <Switch checked={settings.notification_types.mentions} onCheckedChange={val => setSettings(s => ({ ...s, notification_types: { ...s.notification_types, mentions: val } }))} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Due Date Reminders</Label>
                    <p className="text-sm text-muted-foreground">Reminders for upcoming due dates</p>
                  </div>
                  <Switch checked={settings.notification_types.due_date_reminders} onCheckedChange={val => setSettings(s => ({ ...s, notification_types: { ...s.notification_types, due_date_reminders: val } }))} />
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSavePreferences}>
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </Button>
          </TabsContent>

          <TabsContent value="data" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
                <CardDescription>Download a backup of all your data</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleExportAll}>
                  <Download className="h-4 w-4 mr-2" />
                  Export All Data (JSON)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Import Data</CardTitle>
                <CardDescription>Restore from a previous backup</CardDescription>
              </CardHeader>
              <CardContent>
                <Label htmlFor="import-file" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors w-fit">
                    <Upload className="h-4 w-4" />
                    Choose Backup File
                  </div>
                  <input id="import-file" type="file" accept=".json" className="hidden" onChange={handleImportData} />
                </Label>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-500">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions</CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Project Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all tickets, epics, projects, team members, and other data. Your account and settings will be preserved. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearAll} className="bg-red-500 hover:bg-red-600">
                        Yes, Clear All Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
