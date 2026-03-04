'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { UserRole } from '@/types'
import { getUserProfile, saveUserProfile } from '@/lib/user-profiles'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Camera, Check, Shield, User, Briefcase, Mail, Pencil, Lock } from 'lucide-react'

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; glow: string }> = {
  super_admin: {
    label: 'Super Admin',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    glow: 'shadow-[0_0_20px_rgba(251,191,36,0.35)]',
  },
  admin: {
    label: 'Admin',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    glow: 'shadow-[0_0_20px_rgba(96,165,250,0.35)]',
  },
  member: {
    label: 'Member',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    glow: 'shadow-[0_0_20px_rgba(52,211,153,0.35)]',
  },
}

function getRoleConfig(role?: string) {
  return ROLE_CONFIG[role ?? 'member'] ?? ROLE_CONFIG.member
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'
}

export interface UserProfileSheetProps {
  open: boolean
  onClose: () => void
  /** Whose profile to show. Omit to show the current user's own profile. */
  targetUserId?: string
  /** Fallback display name if the profile isn't in the registry yet */
  targetUserName?: string
}

export function UserProfileSheet({ open, onClose, targetUserId, targetUserName }: UserProfileSheetProps) {
  const { user, updateProfile } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resolvedUserId = targetUserId ?? user?.id ?? ''
  const isOwnProfile = resolvedUserId === user?.id
  const canEdit = isOwnProfile || user?.role === 'super_admin' || user?.role === 'admin'

  // Profile data state
  const [profile, setProfile] = useState(() => getUserProfile(resolvedUserId))
  const [name, setName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Reload when sheet opens or target changes
  useEffect(() => {
    if (!open) return
    const p = getUserProfile(resolvedUserId)
    // For own profile, prefer live auth user data
    const effective = isOwnProfile && user
      ? { ...p, userId: user.id, name: user.name, avatar: user.avatar ?? p?.avatar, jobTitle: user.jobTitle, role: user.role, email: user.email }
      : p
    setProfile(effective ?? { userId: resolvedUserId, name: targetUserName ?? '' })
    setName(effective?.name ?? targetUserName ?? '')
    setJobTitle(effective?.jobTitle ?? '')
    setAvatarPreview(effective?.avatar)
    setSaved(false)
  }, [open, resolvedUserId])

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

    if (isOwnProfile) {
      updateProfile({ name: name.trim(), jobTitle: jobTitle.trim() || undefined, avatar: avatarPreview })
    } else {
      // Admin editing another user's profile
      saveUserProfile({
        userId: resolvedUserId,
        name: name.trim(),
        jobTitle: jobTitle.trim() || undefined,
        avatar: avatarPreview,
        role: profile?.role,
        email: profile?.email,
      })
    }

    setIsSaving(false)
    setSaved(true)
    toast.success('Profile updated')
    setTimeout(() => setSaved(false), 2000)
  }

  const roleConfig = getRoleConfig(isOwnProfile ? user?.role : profile?.role)
  const displayName = name || profile?.name || targetUserName || 'Unknown'
  const initials = getInitials(displayName)
  const hasAvatar = Boolean(avatarPreview)

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose() }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[420px] p-0 flex flex-col border-l border-white/[0.06] bg-[#0d0d12]"
      >
        {/* Gradient header band */}
        <div className="relative h-28 flex-shrink-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-violet-600/20 to-transparent" />
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99,102,241,0.4) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.3) 0%, transparent 50%)' }}
          />
          <div className="absolute inset-0 backdrop-blur-sm" />
          <SheetHeader className="relative z-10 px-6 pt-5">
            <SheetTitle className="text-white/90 font-semibold tracking-tight text-base">
              {canEdit ? (isOwnProfile ? 'My Profile' : `Edit Profile`) : 'Profile'}
            </SheetTitle>
            <p className="text-white/40 text-xs mt-0.5">
              {canEdit ? 'Your identity on TicketTracker' : `${displayName}'s profile`}
            </p>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Avatar — floats over header band */}
          <div className="-mt-12 mb-6 flex flex-col items-center gap-3">
            <div
              className={`relative ${canEdit ? 'group cursor-pointer' : ''} rounded-full transition-all duration-300 ${
                isDraggingOver ? 'scale-105' : ''
              }`}
              onClick={() => canEdit && fileInputRef.current?.click()}
              onDragOver={e => { if (canEdit) { e.preventDefault(); setIsDraggingOver(true) } }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={canEdit ? handleDrop : undefined}
            >
              <Avatar
                className={`h-20 w-20 ring-offset-2 ring-offset-[#0d0d12] shadow-xl transition-all duration-300 ${
                  hasAvatar
                    ? `ring-2 ring-blue-400/70 ${roleConfig.glow}`
                    : 'ring-2 ring-white/10'
                } ${isDraggingOver ? 'ring-blue-400/80' : ''}`}
              >
                {avatarPreview && <AvatarImage src={avatarPreview} alt={displayName} className="object-cover" />}
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-violet-700 text-white text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {/* Camera overlay — edit mode only */}
              {canEdit && (
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              )}
            </div>

            {canEdit && (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <p className="text-[11px] text-white/30">Click or drag to upload · JPG, PNG, GIF up to 5 MB</p>
              </>
            )}

            {/* View-only: show name prominently under avatar */}
            {!canEdit && (
              <div className="text-center">
                <p className="text-white text-lg font-bold">{displayName}</p>
                {profile?.jobTitle && <p className="text-white/40 text-sm mt-0.5">{profile.jobTitle}</p>}
              </div>
            )}
          </div>

          {/* Role badge */}
          <div className={`mb-6 rounded-xl border ${roleConfig.border} ${roleConfig.bg} p-4 flex items-center gap-3`}>
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${roleConfig.bg} ${roleConfig.border} border`}>
              <Shield className={`h-4 w-4 ${roleConfig.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/40 mb-0.5">Platform Role</p>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${roleConfig.color}`}>{roleConfig.label}</span>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${roleConfig.bg} ${roleConfig.border} ${roleConfig.color}`}>
                  {(isOwnProfile ? user?.role : profile?.role) ?? 'member'}
                </Badge>
              </div>
            </div>
            <Lock className="h-3.5 w-3.5 text-white/20 flex-shrink-0" />
          </div>

          <Separator className="mb-6 bg-white/[0.06]" />

          {canEdit ? (
            /* ── EDIT MODE ── */
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs text-white/50 flex items-center gap-1.5 uppercase tracking-wider font-medium">
                  <User className="h-3 w-3" /> Display Name
                </Label>
                <div className="relative">
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                    className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50 pr-8" />
                  <Pencil className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-white/20 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-white/50 flex items-center gap-1.5 uppercase tracking-wider font-medium">
                  <Mail className="h-3 w-3" /> Email
                </Label>
                <Input value={isOwnProfile ? (user?.email ?? '') : (profile?.email ?? '')} readOnly
                  className="bg-white/[0.02] border-white/[0.04] text-white/30 cursor-not-allowed" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-white/50 flex items-center gap-1.5 uppercase tracking-wider font-medium">
                  <Briefcase className="h-3 w-3" /> Job Title
                </Label>
                <div className="relative">
                  <Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Senior Frontend Developer"
                    className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50 pr-8" />
                  <Pencil className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-white/20 pointer-events-none" />
                </div>
                <p className="text-[11px] text-white/25">Personalises your messaging toolbar and team listings</p>
              </div>
            </div>
          ) : (
            /* ── VIEW-ONLY MODE ── */
            <div className="space-y-4">
              {profile?.email && (
                <div className="flex items-center gap-3 px-1">
                  <Mail className="h-4 w-4 text-white/30 flex-shrink-0" />
                  <span className="text-sm text-white/50">{profile.email}</span>
                </div>
              )}
              {profile?.jobTitle && (
                <div className="flex items-center gap-3 px-1">
                  <Briefcase className="h-4 w-4 text-white/30 flex-shrink-0" />
                  <span className="text-sm text-white/50">{profile.jobTitle}</span>
                </div>
              )}
              <div className="mt-6 rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3 flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-white/20 flex-shrink-0" />
                <p className="text-[11px] text-white/25">Contact an admin to update this profile</p>
              </div>
            </div>
          )}
        </div>

        {/* Sticky footer — edit mode only */}
        {canEdit && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-white/[0.06] bg-[#0d0d12]">
            <Button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className={`w-full h-10 font-semibold transition-all duration-300 ${
                saved
                  ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-500/20'
              }`}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Saving…
                </span>
              ) : saved ? (
                <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Saved</span>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
