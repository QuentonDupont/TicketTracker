"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  MoreVertical,
  Edit,
  Save,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Target,
  TrendingUp,
  Clock,
  Briefcase,
  Award,
  Plus,
  Trash2
} from "lucide-react"
import { TeamMember, CustomFieldDefinition } from '@/types'
import { getTeamMember, updateTeamMember, updateTeamMemberField, deleteTeamMember, getCustomFields, setCustomFieldValue } from '@/lib/team-storage'
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"

export default function TeamMemberDetailPage() {
  const router = useRouter()
  const params = useParams()
  const memberId = params?.id ? parseInt(params.id as string) : null

  const [member, setMember] = useState<TeamMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([])

  // Editing states
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [editedEmail, setEditedEmail] = useState('')
  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [editedPhone, setEditedPhone] = useState('')

  useEffect(() => {
    if (!memberId) {
      router.push('/team')
      return
    }

    const loadedMember = getTeamMember(memberId)
    if (!loadedMember) {
      toast.error('Team member not found')
      router.push('/team')
      return
    }

    setMember(loadedMember)
    setCustomFields(getCustomFields())
    setLoading(false)
  }, [memberId, router])

  const reloadMember = () => {
    if (!memberId) return
    const loadedMember = getTeamMember(memberId)
    if (loadedMember) {
      setMember(loadedMember)
    }
  }

  const handleFieldUpdate = <K extends keyof TeamMember>(field: K, value: TeamMember[K]) => {
    if (!memberId) return
    const success = updateTeamMemberField(memberId, field, value)
    if (success) {
      reloadMember()
    }
  }

  const handleNameEdit = () => {
    if (!member) return
    setEditedName(member.name)
    setIsEditingName(true)
  }

  const handleNameSave = () => {
    if (!memberId || !editedName.trim()) return
    handleFieldUpdate('name', editedName)
    setIsEditingName(false)
  }

  const handleNameCancel = () => {
    setIsEditingName(false)
  }

  const handleEmailEdit = () => {
    if (!member) return
    setEditedEmail(member.email)
    setIsEditingEmail(true)
  }

  const handleEmailSave = () => {
    if (!memberId || !editedEmail.trim()) return
    handleFieldUpdate('email', editedEmail)
    setIsEditingEmail(false)
  }

  const handleEmailCancel = () => {
    setIsEditingEmail(false)
  }

  const handlePhoneEdit = () => {
    if (!member) return
    setEditedPhone(member.phone)
    setIsEditingPhone(true)
  }

  const handlePhoneSave = () => {
    if (!memberId || !editedPhone.trim()) return
    handleFieldUpdate('phone', editedPhone)
    setIsEditingPhone(false)
  }

  const handlePhoneCancel = () => {
    setIsEditingPhone(false)
  }

  const handleDelete = () => {
    if (!memberId || !confirm('Are you sure you want to remove this team member?')) return
    deleteTeamMember(memberId)
    router.push('/team')
  }

  const handleCustomFieldUpdate = (fieldId: string, value: any) => {
    if (!memberId) return
    const success = setCustomFieldValue(memberId, fieldId, value)
    if (success) {
      reloadMember()
      toast.success('Field updated')
    }
  }

  const getCustomFieldValue = (fieldId: string): any => {
    return member?.customFieldValues?.[fieldId] || ''
  }

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
      : 'bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30'
  }

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'senior':
        return 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30'
      case 'mid':
        return 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30'
      case 'junior':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30'
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading team member...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!member) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-muted-foreground">Team member not found</p>
            <Button variant="link" asChild className="mt-4">
              <Link href="/team">Back to Team</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <span className="mx-2">/</span>
          <Link href="/team" className="hover:text-foreground transition-colors">
            Team
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{member.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/team')}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white">
                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-3xl font-bold h-12"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNameSave()
                      if (e.key === 'Escape') handleNameCancel()
                    }}
                  />
                  <Button size="sm" onClick={handleNameSave}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleNameCancel}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h1 className="text-3xl font-bold tracking-tight">{member.name}</h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNameEdit}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Badge className={getSkillLevelColor(member.skillLevel)}>
                  {member.skillLevel.charAt(0).toUpperCase() + member.skillLevel.slice(1)}
                </Badge>
                <Badge className={getStatusColor(member.status)}>
                  {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/team/${member.id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Column (2/3) */}
          <div className="md:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-cyan-400" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground text-sm">Email</Label>
                  {isEditingEmail ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="email"
                        value={editedEmail}
                        onChange={(e) => setEditedEmail(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEmailSave()
                          if (e.key === 'Escape') handleEmailCancel()
                        }}
                      />
                      <Button size="sm" onClick={handleEmailSave}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleEmailCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group mt-1">
                      <p className="text-foreground">{member.email}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEmailEdit}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-muted-foreground text-sm">Phone</Label>
                  {isEditingPhone ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="tel"
                        value={editedPhone}
                        onChange={(e) => setEditedPhone(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handlePhoneSave()
                          if (e.key === 'Escape') handlePhoneCancel()
                        }}
                      />
                      <Button size="sm" onClick={handlePhoneSave}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handlePhoneCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group mt-1">
                      <p className="text-foreground">{member.phone}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePhoneEdit}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-muted-foreground text-sm">Location</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-foreground">{member.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Dashboard */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>Current performance and productivity stats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground text-sm">Availability</Label>
                      <span className="text-sm font-medium">{member.availability}%</span>
                    </div>
                    <Progress value={member.availability} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground text-sm">Performance Score</Label>
                      <span className="text-sm font-medium">{member.performanceScore}%</span>
                    </div>
                    <Progress value={member.performanceScore} className="[&>div]:bg-emerald-500" />
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-cyan-400" />
                      <Label className="text-muted-foreground text-sm">Completed Tickets</Label>
                    </div>
                    <p className="text-2xl font-bold">{member.completedTickets}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-purple-400" />
                      <Label className="text-muted-foreground text-sm">Avg Resolution Time</Label>
                    </div>
                    <p className="text-2xl font-bold">{member.avgResolutionTime}h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Assignments */}
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-cyan-400" />
                    Current Projects
                  </CardTitle>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Assign Project
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {member.currentProjects.length > 0 ? (
                  <div className="space-y-3">
                    {member.currentProjects.map((project, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{project}</h4>
                            <p className="text-sm text-muted-foreground mt-1">Active contributor</p>
                          </div>
                          <Badge variant="outline" className="border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
                            Active
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No current projects assigned</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills Matrix */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-400" />
                  Skills & Expertise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {member.skills.map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{skill.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {skill.category}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">{skill.level}%</span>
                      </div>
                      <Progress value={skill.level} className="[&>div]:bg-purple-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6">
            {/* Quick Details */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground text-sm">Role</Label>
                  <Select
                    value={member.role}
                    onValueChange={(value) => handleFieldUpdate('role', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                      <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                      <SelectItem value="Full Stack Developer">Full Stack Developer</SelectItem>
                      <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                      <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                      <SelectItem value="Product Manager">Product Manager</SelectItem>
                      <SelectItem value="Designer">Designer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-muted-foreground text-sm">Department</Label>
                  <Select
                    value={member.department}
                    onValueChange={(value) => handleFieldUpdate('department', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-muted-foreground text-sm">Skill Level</Label>
                  <Select
                    value={member.skillLevel}
                    onValueChange={(value) => handleFieldUpdate('skillLevel', value as 'senior' | 'mid' | 'junior')}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="mid">Mid-Level</SelectItem>
                      <SelectItem value="junior">Junior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-muted-foreground text-sm">Status</Label>
                  <Select
                    value={member.status}
                    onValueChange={(value) => handleFieldUpdate('status', value as 'active' | 'inactive')}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div>
                  <Label className="text-muted-foreground text-sm flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Join Date
                  </Label>
                  <p className="text-foreground mt-1">
                    {new Date(member.joinDate).toLocaleDateString()}
                  </p>
                </div>

                {member.manager && (
                  <div>
                    <Label className="text-muted-foreground text-sm flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Manager
                    </Label>
                    <p className="text-foreground mt-1">{member.manager}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Custom Fields */}
            {customFields.length > 0 && (
              <Card className="glass">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Custom Fields</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push('/team/settings/custom-fields')}
                      className="text-xs"
                    >
                      Manage Fields
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customFields.map((field) => {
                    const fieldValue = getCustomFieldValue(field.id)

                    return (
                      <div key={field.id}>
                        <Label className="text-muted-foreground text-sm flex items-center gap-2">
                          {field.label}
                          {field.required && <span className="text-destructive">*</span>}
                        </Label>
                        {field.helpText && (
                          <p className="text-xs text-muted-foreground mb-1">{field.helpText}</p>
                        )}
                        <div className="mt-1">
                          {field.type === 'text' && (
                            <Input
                              value={fieldValue}
                              onChange={(e) => handleCustomFieldUpdate(field.id, e.target.value)}
                              placeholder={`Enter ${field.label.toLowerCase()}...`}
                            />
                          )}
                          {field.type === 'number' && (
                            <Input
                              type="number"
                              value={fieldValue}
                              onChange={(e) => handleCustomFieldUpdate(field.id, e.target.value)}
                              placeholder={`Enter ${field.label.toLowerCase()}...`}
                            />
                          )}
                          {field.type === 'date' && (
                            <Input
                              type="date"
                              value={fieldValue}
                              onChange={(e) => handleCustomFieldUpdate(field.id, e.target.value)}
                            />
                          )}
                          {field.type === 'boolean' && (
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={fieldValue === true || fieldValue === 'true'}
                                onCheckedChange={(checked) => handleCustomFieldUpdate(field.id, checked)}
                              />
                              <span className="text-sm">{fieldValue ? 'Yes' : 'No'}</span>
                            </div>
                          )}
                          {field.type === 'select' && (
                            <Select
                              value={fieldValue}
                              onValueChange={(value) => handleCustomFieldUpdate(field.id, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map((option, index) => (
                                  <SelectItem key={index} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          {field.type === 'multiselect' && (
                            <div className="border rounded-lg p-3 space-y-2">
                              {field.options?.map((option, index) => {
                                const selectedValues = Array.isArray(fieldValue) ? fieldValue : []
                                const isChecked = selectedValues.includes(option)
                                return (
                                  <div key={index} className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={isChecked}
                                      onCheckedChange={(checked) => {
                                        const currentValues = Array.isArray(fieldValue) ? fieldValue : []
                                        const newValues = checked
                                          ? [...currentValues, option]
                                          : currentValues.filter((v: string) => v !== option)
                                        handleCustomFieldUpdate(field.id, newValues)
                                      }}
                                    />
                                    <label className="text-sm">{option}</label>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
