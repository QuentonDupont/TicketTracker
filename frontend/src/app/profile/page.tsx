'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { getUserProfile, saveUserProfile } from '@/lib/user-profiles'
import { MainLayout } from '@/components/layout/main-layout'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Camera, Check, Shield, Briefcase, Mail, Pencil, Lock,
  Ticket, MessageSquare, Layers, Star, Clock, Activity,
} from 'lucide-react'

const ROLE_CONFIG: Record<string, {
  label: string; color: string; bg: string; border: string
  glow: string; accent: string; description: string
}> = {
  super_admin: {
    label: 'Super Admin', color: 'text-amber-400', bg: 'bg-amber-500/10',
    border: 'border-amber-500/30', glow: 'shadow-[0_0_40px_rgba(251,191,36,0.25)]',
    accent: '#f59e0b', description: 'Full platform access — manage users, roles and all settings',
  },
  admin: {
    label: 'Admin', color: 'text-blue-400', bg: 'bg-blue-500/10',
    border: 'border-blue-500/30', glow: 'shadow-[0_0_40px_rgba(96,165,250,0.25)]',
    accent: '#60a5fa', description: 'Manage team members, channels, and project settings',
  },
  member: {
    label: 'Member', color: 'text-emerald-400', bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30', glow: 'shadow-[0_0_40px_rgba(52,211,153,0.25)]',
    accent: '#34d399', description: 'Standard access to tickets, messages and projects',
  },
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'
}

function getRoleConfig(role?: string) {
  return ROLE_CONFIG[role ?? 'member'] ?? ROLE_CONFIG.member
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number | string; color: string
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 flex items-center gap-3">
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-xs text-white/40">{label}</p>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [stats, setStats] = useState({ tickets: 0, messages: 0, epics: 0, live: 0 })

  useEffect(() => {
    if (!user) return
    setName(user.name)
    setJobTitle(user.jobTitle ?? '')
    setAvatarPreview(user.avatar)

    // Load activity stats from localStorage
    try {
      const tickets = JSON.parse(localStorage.getItem('tickets') ?? '[]')
      const messages = JSON.parse(localStorage.getItem('messaging_messages') ?? '[]')
      const epics = JSON.parse(localStorage.getItem('epics') ?? '[]')
      setStats({
        tickets: tickets.filter((t: any) => t.assignee === user.name).length,
        messages: messages.filter((m: any) => m.sender_id === user.id).length,
        epics: epics.length,
        live: tickets.filter((t: any) => t.status === 'Live' && t.assignee === user.name).length,
      })
    } catch { /* ignore */ }
  }, [user])

  const processImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be smaller than 5 MB'); return }
    const reader = new FileReader()
    reader.onload = e => setAvatarPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processImageFile(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processImageFile(file)
  }

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name cannot be empty'); return }
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 350))
    updateProfile({ name: name.trim(), jobTitle: jobTitle.trim() || undefined, avatar: avatarPreview })
    if (user) {
      saveUserProfile({ userId: user.id, name: name.trim(), avatar: avatarPreview, jobTitle: jobTitle.trim() || undefined, role: user.role, email: user.email })
    }
    setIsSaving(false)
    setSaved(true)
    toast.success('Profile updated')
    setTimeout(() => setSaved(false), 2500)
  }

  if (!user) return null

  const roleConfig = getRoleConfig(user.role)
  const initials = getInitials(name || user.name)
  const hasAvatar = Boolean(avatarPreview)

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* ── Hero card ── */}
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.06]">
          {/* Cover gradient */}
          <div className="h-36 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-violet-900/40 to-slate-900" />
            <div className="absolute inset-0"
              style={{ backgroundImage: 'radial-gradient(ellipse at 30% 60%, rgba(99,102,241,0.35) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(59,130,246,0.25) 0%, transparent 55%)' }}
            />
            {/* Role accent line at bottom of cover */}
            <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${roleConfig.accent}60, transparent)` }} />
          </div>

          <div className="bg-[#0d0d12] px-8 pb-8">
            {/* Avatar row */}
            <div className="flex items-end gap-6 -mt-14 mb-6">
              <div
                className={`relative group cursor-pointer rounded-full flex-shrink-0 transition-all duration-300 ${isDraggingOver ? 'scale-105' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDraggingOver(true) }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={handleDrop}
              >
                <Avatar className={`h-28 w-28 ring-offset-4 ring-offset-[#0d0d12] shadow-2xl transition-all duration-300 ${
                  hasAvatar
                    ? `ring-2 ring-offset-2 ${roleConfig.glow}`
                    : 'ring-2 ring-white/10'
                }`}
                  style={hasAvatar ? { '--tw-ring-color': `${roleConfig.accent}80` } as React.CSSProperties : {}}>
                  {avatarPreview && <AvatarImage src={avatarPreview} alt={name} className="object-cover" />}
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-violet-700 text-white text-3xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                  <Camera className="h-6 w-6 text-white" />
                  <span className="text-white text-[10px] font-medium">Change</span>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

              <div className="pb-1 flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-white truncate">{name || user.name}</h1>
                {jobTitle && <p className="text-white/50 text-sm mt-0.5">{jobTitle}</p>}
                <p className="text-white/30 text-xs mt-1">{user.email}</p>
              </div>

              <div className="pb-1 flex-shrink-0">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${roleConfig.border} ${roleConfig.bg}`}>
                  <Shield className={`h-3.5 w-3.5 ${roleConfig.color}`} />
                  <span className={`text-sm font-semibold ${roleConfig.color}`}>{roleConfig.label}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-white/25 -mt-2">
              Click avatar or drag &amp; drop to upload · JPG, PNG, GIF up to 5 MB
            </p>
          </div>
        </div>

        {/* ── Activity stats ── */}
        <div>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Activity</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={Ticket} label="Assigned Tickets" value={stats.tickets} color="bg-blue-500/10 text-blue-400" />
            <StatCard icon={Check} label="Live Tickets" value={stats.live} color="bg-emerald-500/10 text-emerald-400" />
            <StatCard icon={MessageSquare} label="Messages Sent" value={stats.messages} color="bg-violet-500/10 text-violet-400" />
            <StatCard icon={Layers} label="Total Epics" value={stats.epics} color="bg-amber-500/10 text-amber-400" />
          </div>
        </div>

        {/* ── Profile details form ── */}
        <div>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Profile Details</h2>
          <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d12] p-6 space-y-6">

            <div className="grid md:grid-cols-2 gap-6">
              {/* Display name */}
              <div className="space-y-1.5">
                <Label className="text-xs text-white/50 flex items-center gap-1.5 uppercase tracking-wider font-medium">
                  <Pencil className="h-3 w-3" /> Display Name
                </Label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50 focus:ring-blue-500/20 h-11"
                />
              </div>

              {/* Job title */}
              <div className="space-y-1.5">
                <Label className="text-xs text-white/50 flex items-center gap-1.5 uppercase tracking-wider font-medium">
                  <Briefcase className="h-3 w-3" /> Job Title
                </Label>
                <Input
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Developer"
                  className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50 focus:ring-blue-500/20 h-11"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50 flex items-center gap-1.5 uppercase tracking-wider font-medium">
                <Mail className="h-3 w-3" /> Email Address
              </Label>
              <div className="relative">
                <Input
                  value={user.email}
                  readOnly
                  className="bg-white/[0.02] border-white/[0.04] text-white/30 cursor-not-allowed h-11 pr-24"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20 font-mono bg-white/[0.04] px-2 py-0.5 rounded">
                  read-only
                </span>
              </div>
            </div>

            <Separator className="bg-white/[0.06]" />

            {/* Platform role */}
            <div className={`rounded-xl border ${roleConfig.border} ${roleConfig.bg} p-4 flex items-center gap-4`}>
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${roleConfig.bg} border ${roleConfig.border}`}>
                <Shield className={`h-5 w-5 ${roleConfig.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`font-bold ${roleConfig.color}`}>{roleConfig.label}</span>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${roleConfig.bg} ${roleConfig.border} ${roleConfig.color}`}>
                    {user.role ?? 'member'}
                  </Badge>
                </div>
                <p className="text-xs text-white/40">{roleConfig.description}</p>
              </div>
              <Lock className="h-4 w-4 text-white/20 flex-shrink-0" />
            </div>

            {/* Save */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={isSaving || !name.trim()}
                className={`px-8 h-11 font-semibold transition-all duration-300 ${
                  saved
                    ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-500/20'
                }`}
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Saving…
                  </span>
                ) : saved ? (
                  <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Saved</span>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  )
}
