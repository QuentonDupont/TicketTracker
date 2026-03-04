"use client"

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  Clock,
  Edit,
  Trash2,
  MoreHorizontal,
  CheckCircle,
  Circle,
  AlertCircle,
  ChevronRight,
  Target,
  Save,
  X,
  Plus,
  Code,
  ClipboardCheck,
  Beaker,
  Rocket,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"
import { Ticket, Epic, TicketActivity, TicketComment } from "@/types"
import { LinkedTicketsCard } from "@/components/linked-tickets-card"
import { LinkedDocumentsCard } from "@/components/linked-documents-card"
import { TicketLinkModal } from "@/components/ticket-link-modal"
import { seedDummyDocumentLinks } from "@/lib/document-links"
import { useAuth } from "@/lib/auth"
import { getActivitiesForTicket, logTicketChange } from "@/lib/activity-storage"
import { getCommentsForTicket, addComment, updateComment, deleteComment } from "@/lib/comment-storage"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, Send, Pencil, Trash2 as TrashIcon } from "lucide-react"

const statusColors = {
  'To Do': 'bg-gray-500 text-white',
  'In Progress': 'bg-blue-500 text-white',
  'Ready for Code Review': 'bg-blue-600 text-white',
  'Ready For QA': 'bg-orange-500 text-white',
  'In QA': 'bg-yellow-500 text-white',
  'Ready to Release': 'bg-indigo-500 text-white',
  'Live': 'bg-green-500 text-white'
}

const priorityColors = {
  'Low': 'bg-green-100 text-green-800 border-green-200',
  'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'High': 'bg-red-100 text-red-800 border-red-200'
}

const statusIcons = {
  'To Do': Circle,
  'In Progress': Clock,
  'Ready for Code Review': Code,
  'Ready For QA': ClipboardCheck,
  'In QA': Beaker,
  'Ready to Release': Rocket,
  'Live': CheckCircle2
}

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [linkedEpic, setLinkedEpic] = useState<Epic | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Activity and comment states
  const [activities, setActivities] = useState<TicketActivity[]>([])
  const [comments, setComments] = useState<TicketComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingCommentContent, setEditingCommentContent] = useState('')

  // Inline editing states
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [isEditingCurrentResults, setIsEditingCurrentResults] = useState(false)
  const [isEditingExpectedResults, setIsEditingExpectedResults] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [editedCurrentResults, setEditedCurrentResults] = useState('')
  const [editedExpectedResults, setEditedExpectedResults] = useState('')
  const [newTag, setNewTag] = useState('')
  const [availableEpics, setAvailableEpics] = useState<Epic[]>([])
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [linkRefreshKey, setLinkRefreshKey] = useState(0)

  const refreshActivitiesAndComments = (ticketId: number) => {
    setActivities(getActivitiesForTicket(ticketId))
    setComments(getCommentsForTicket(ticketId))
  }

  useEffect(() => {
    // Load ticket from localStorage
    const loadTicket = () => {
      try {
        const storedTickets = localStorage.getItem('tickets')
        if (storedTickets) {
          const tickets: Ticket[] = JSON.parse(storedTickets)
          const found = tickets.find(t => t.id === parseInt(resolvedParams.id))
          if (found) {
            setTicket(found)
            refreshActivitiesAndComments(found.id)

            // Load linked epic if exists
            if (found.epic_id) {
              const storedEpics = localStorage.getItem('epics')
              if (storedEpics) {
                const epics: Epic[] = JSON.parse(storedEpics)
                const epic = epics.find(e => e.id === found.epic_id)
                if (epic) {
                  setLinkedEpic(epic)
                }
              }
            }
          } else {
            toast.error('Ticket not found')
            router.push('/tickets')
          }
        } else {
          toast.error('No tickets found')
          router.push('/tickets')
        }
      } catch (error) {
        toast.error('Error loading ticket')
        router.push('/tickets')
      } finally {
        setIsLoading(false)
      }
    }

    loadTicket()
    seedDummyDocumentLinks()
  }, [resolvedParams.id, router])

  // Load available epics for epic selection
  useEffect(() => {
    try {
      const storedEpics = localStorage.getItem('epics')
      if (storedEpics) {
        const epics: Epic[] = JSON.parse(storedEpics)
        setAvailableEpics(epics)
      }
    } catch (error) {
      console.error('Error loading epics:', error)
    }
  }, [])

  const handleStatusChange = (newStatus: Ticket['status']) => {
    if (!ticket) return

    try {
      const oldStatus = ticket.status
      const storedTickets = localStorage.getItem('tickets')
      if (storedTickets) {
        const tickets: Ticket[] = JSON.parse(storedTickets)
        const updatedTickets = tickets.map(t =>
          t.id === ticket.id ? { ...t, status: newStatus } : t
        )
        localStorage.setItem('tickets', JSON.stringify(updatedTickets))
        logTicketChange(ticket.id, 'status_change', `Status changed from ${oldStatus} to ${newStatus}`, user?.name || 'Unknown', 'status', oldStatus, newStatus)
        setTicket({ ...ticket, status: newStatus })
        refreshActivitiesAndComments(ticket.id)
        toast.success(`Status updated to ${newStatus}`)
      }
    } catch (error) {
      toast.error('Error updating status')
    }
  }

  const handleDelete = () => {
    if (!ticket) return

    if (confirm('Are you sure you want to delete this ticket?')) {
      try {
        const storedTickets = localStorage.getItem('tickets')
        if (storedTickets) {
          const tickets: Ticket[] = JSON.parse(storedTickets)
          const updatedTickets = tickets.filter(t => t.id !== ticket.id)
          localStorage.setItem('tickets', JSON.stringify(updatedTickets))
          toast.success('Ticket deleted successfully')
          router.push('/tickets')
        }
      } catch (error) {
        toast.error('Error deleting ticket')
      }
    }
  }

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'Live' || status === 'Ready to Release') return false
    const due = new Date(dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return due < today
  }

  // Generic update function for ticket fields
  const updateTicketField = (field: keyof Ticket, value: any) => {
    if (!ticket) return

    try {
      const oldValue = ticket[field]
      const storedTickets = localStorage.getItem('tickets')
      if (storedTickets) {
        const tickets: Ticket[] = JSON.parse(storedTickets)
        const updatedTickets = tickets.map(t =>
          t.id === ticket.id ? { ...t, [field]: value } : t
        )
        localStorage.setItem('tickets', JSON.stringify(updatedTickets))

        // Log activity for the field change
        const activityType = field === 'priority' ? 'priority_change'
          : field === 'assignee' ? 'assignee_change'
          : field === 'tags' ? 'tag_change'
          : field === 'epic_id' ? 'epic_change'
          : 'field_edit'
        const oldStr = typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue ?? '')
        const newStr = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')
        logTicketChange(ticket.id, activityType, `${field.replace(/_/g, ' ')} updated`, user?.name || 'Unknown', field, oldStr, newStr)

        setTicket({ ...ticket, [field]: value })

        // Update linked epic if epic_id changed
        if (field === 'epic_id') {
          if (value) {
            const epic = availableEpics.find(e => e.id === value)
            setLinkedEpic(epic || null)
          } else {
            setLinkedEpic(null)
          }
        }

        refreshActivitiesAndComments(ticket.id)
        toast.success(`${field.replace(/_/g, ' ')} updated successfully`)
      }
    } catch (error) {
      toast.error(`Error updating ${field.replace(/_/g, ' ')}`)
    }
  }

  // Title editing handlers
  const handleTitleEdit = () => {
    if (!ticket) return
    setEditedTitle(ticket.title)
    setIsEditingTitle(true)
  }

  const handleTitleSave = () => {
    if (!ticket || !editedTitle.trim()) {
      toast.error('Title cannot be empty')
      return
    }
    updateTicketField('title', editedTitle.trim())
    setIsEditingTitle(false)
  }

  const handleTitleCancel = () => {
    setIsEditingTitle(false)
    setEditedTitle('')
  }

  // Description editing handlers
  const handleDescriptionEdit = () => {
    if (!ticket) return
    setEditedDescription(ticket.description)
    setIsEditingDescription(true)
  }

  const handleDescriptionSave = () => {
    if (!ticket || !editedDescription.trim()) {
      toast.error('Description cannot be empty')
      return
    }
    updateTicketField('description', editedDescription.trim())
    setIsEditingDescription(false)
  }

  const handleDescriptionCancel = () => {
    setIsEditingDescription(false)
    setEditedDescription('')
  }

  // Current Results editing handlers
  const handleCurrentResultsEdit = () => {
    if (!ticket) return
    setEditedCurrentResults(ticket.current_results)
    setIsEditingCurrentResults(true)
  }

  const handleCurrentResultsSave = () => {
    if (!ticket || !editedCurrentResults.trim()) {
      toast.error('Current results cannot be empty')
      return
    }
    if (editedCurrentResults.trim().length < 10) {
      toast.error('Current results must be at least 10 characters')
      return
    }
    updateTicketField('current_results', editedCurrentResults.trim())
    setIsEditingCurrentResults(false)
  }

  const handleCurrentResultsCancel = () => {
    setIsEditingCurrentResults(false)
    setEditedCurrentResults('')
  }

  // Expected Results editing handlers
  const handleExpectedResultsEdit = () => {
    if (!ticket) return
    setEditedExpectedResults(ticket.expected_results)
    setIsEditingExpectedResults(true)
  }

  const handleExpectedResultsSave = () => {
    if (!ticket || !editedExpectedResults.trim()) {
      toast.error('Expected results cannot be empty')
      return
    }
    if (editedExpectedResults.trim().length < 10) {
      toast.error('Expected results must be at least 10 characters')
      return
    }
    updateTicketField('expected_results', editedExpectedResults.trim())
    setIsEditingExpectedResults(false)
  }

  const handleExpectedResultsCancel = () => {
    setIsEditingExpectedResults(false)
    setEditedExpectedResults('')
  }

  // Tag handlers
  const handleAddTag = () => {
    if (!ticket || !newTag.trim()) return
    if (ticket.tags?.includes(newTag.trim())) {
      toast.error('Tag already exists')
      return
    }
    const updatedTags = [...(ticket.tags || []), newTag.trim()]
    updateTicketField('tags', updatedTags)
    setNewTag('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    if (!ticket) return
    const updatedTags = (ticket.tags || []).filter(tag => tag !== tagToRemove)
    updateTicketField('tags', updatedTags)
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading ticket...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!ticket) {
    return null
  }

  const StatusIcon = statusIcons[ticket.status]

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link href="/tickets" className="hover:text-foreground transition-colors">
            Tickets
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {ticket.title}
          </span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mb-2 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tickets
            </Button>
            <div className="flex items-center gap-3">
              {isEditingTitle ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-3xl font-bold tracking-tight h-12"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleSave()
                      if (e.key === 'Escape') handleTitleCancel()
                    }}
                  />
                  <Button size="sm" onClick={handleTitleSave} className="shrink-0">
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleTitleCancel} className="shrink-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h1 className="text-3xl font-bold tracking-tight">{ticket.title}</h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleTitleEdit}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Badge className={statusColors[ticket.status]}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {ticket.status}
              </Badge>
              <Badge variant="outline" className={priorityColors[ticket.priority]}>
                {ticket.priority} Priority
              </Badge>
              {isOverdue(ticket.due_date, ticket.status) && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleStatusChange('To Do')}>
                <Circle className="mr-2 h-4 w-4" />
                To Do
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('In Progress')}>
                <Clock className="mr-2 h-4 w-4" />
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('Ready for Code Review')}>
                <Code className="mr-2 h-4 w-4" />
                Ready for Code Review
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('Ready For QA')}>
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Ready For QA
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('In QA')}>
                <Beaker className="mr-2 h-4 w-4" />
                In QA
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('Ready to Release')}>
                <Rocket className="mr-2 h-4 w-4" />
                Ready to Release
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('Live')}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Live
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Ticket Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push('/tickets')}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Ticket
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Ticket
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Separator />

        {/* Content Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content - Left Column (2/3 width) */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Description</CardTitle>
                {!isEditingDescription && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDescriptionEdit}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {isEditingDescription ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="min-h-[150px]"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleDescriptionSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleDescriptionCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {ticket.description}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Current Results */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Current Results</CardTitle>
                {!isEditingCurrentResults && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCurrentResultsEdit}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {isEditingCurrentResults ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editedCurrentResults}
                      onChange={(e) => setEditedCurrentResults(e.target.value)}
                      className="min-h-[100px]"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleCurrentResultsSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCurrentResultsCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {ticket.current_results}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Expected Results */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Expected Results</CardTitle>
                {!isEditingExpectedResults && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExpectedResultsEdit}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {isEditingExpectedResults ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editedExpectedResults}
                      onChange={(e) => setEditedExpectedResults(e.target.value)}
                      className="min-h-[100px]"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleExpectedResultsSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleExpectedResultsCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {ticket.expected_results}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>
                  Track all changes and updates to this ticket
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {/* Always show ticket created as first entry */}
                  {activities.map((activity) => {
                    const activityColor = activity.type === 'status_change' ? 'bg-blue-500'
                      : activity.type === 'comment_added' ? 'bg-green-500'
                      : activity.type === 'priority_change' ? 'bg-orange-500'
                      : activity.type === 'assignee_change' ? 'bg-purple-500'
                      : 'bg-gray-400'
                    return (
                      <div key={activity.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-2 h-2 rounded-full ${activityColor} mt-2`}></div>
                          <div className="w-px h-full bg-border mt-1"></div>
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.user_name} &middot; {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="text-sm font-medium">Ticket created</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ticket.created_date).toLocaleDateString()} at{' '}
                        {new Date(ticket.created_date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  {activities.length === 0 && (
                    <div className="text-center py-2 text-sm text-muted-foreground">
                      Activity will appear here as the ticket progresses
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comments ({comments.length})
                </CardTitle>
                <CardDescription>
                  Collaborate with your team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Comment list */}
                {comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium shrink-0">
                          {comment.author_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{comment.author_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })}
                            </span>
                            {comment.is_edited && (
                              <span className="text-xs text-muted-foreground">(edited)</span>
                            )}
                          </div>
                          {editingCommentId === comment.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editingCommentContent}
                                onChange={(e) => setEditingCommentContent(e.target.value)}
                                className="min-h-[60px] text-sm"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => {
                                  if (editingCommentContent.trim()) {
                                    updateComment(comment.id, editingCommentContent.trim())
                                    refreshActivitiesAndComments(ticket.id)
                                    setEditingCommentId(null)
                                    toast.success('Comment updated')
                                  }
                                }}>Save</Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{comment.content}</p>
                          )}
                          {user?.email === comment.author_email && editingCommentId !== comment.id && (
                            <div className="flex gap-1 mt-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => {
                                  setEditingCommentId(comment.id)
                                  setEditingCommentContent(comment.content)
                                }}
                              >
                                <Pencil className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-red-500 hover:text-red-600"
                                onClick={() => {
                                  deleteComment(comment.id)
                                  refreshActivitiesAndComments(ticket.id)
                                  toast.success('Comment deleted')
                                }}
                              >
                                <TrashIcon className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">No comments yet</p>
                    <p className="text-xs mt-1">Be the first to add a comment</p>
                  </div>
                )}

                {/* Add comment form */}
                <Separator />
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium shrink-0">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                    <Button
                      size="sm"
                      disabled={!newComment.trim()}
                      onClick={() => {
                        if (newComment.trim() && user) {
                          addComment(ticket.id, newComment.trim(), user.name, user.email)
                          setNewComment('')
                          refreshActivitiesAndComments(ticket.id)
                          toast.success('Comment added')
                        }
                      }}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Comment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column (1/3 width) */}
          <div className="space-y-6">
            {/* Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ticket Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Assignee */}
                <div className="space-y-1">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Assignee
                  </label>
                  <Select
                    value={ticket.assignee || 'unassigned'}
                    onValueChange={(value) => updateTicketField('assignee', value === 'unassigned' ? '' : value)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      <SelectItem value="alice">Alice Johnson</SelectItem>
                      <SelectItem value="bob">Bob Wilson</SelectItem>
                      <SelectItem value="charlie">Charlie Brown</SelectItem>
                      <SelectItem value="diana">Diana Prince</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Due Date */}
                <div className="space-y-1">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={ticket.due_date}
                    onChange={(e) => updateTicketField('due_date', e.target.value)}
                    className={`text-sm ${isOverdue(ticket.due_date, ticket.status) ? 'text-red-600 font-medium' : ''}`}
                  />
                </div>

                <Separator />

                {/* Created Date */}
                <div className="space-y-1">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Created
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(ticket.created_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <Separator />

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    Tags
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                      className="text-sm flex-1"
                    />
                    <Button size="sm" onClick={handleAddTag} disabled={!newTag.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {ticket.tags && ticket.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {ticket.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          {tag}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No tags</p>
                  )}
                </div>

                <Separator />

                {/* Epic */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    Epic
                  </label>
                  <Select
                    value={ticket.epic_id ? ticket.epic_id.toString() : 'none'}
                    onValueChange={(value) => updateTicketField('epic_id', value === 'none' ? undefined : parseInt(value))}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Link to an epic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Epic</SelectItem>
                      {availableEpics.map((epic) => (
                        <SelectItem key={epic.id} value={epic.id.toString()}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: epic.color }}
                            />
                            {epic.title}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {linkedEpic && (
                    <Link href={`/epics/${linkedEpic.id}`} className="block">
                      <div className="p-3 rounded-lg border hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: linkedEpic.color }}
                          />
                          <span className="text-sm font-medium group-hover:text-blue-400 transition-colors">
                            {linkedEpic.title}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {linkedEpic.description}
                        </p>
                      </div>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ticket ID</span>
                  <span className="text-sm font-medium">#{ticket.id}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Priority</span>
                  <Select
                    value={ticket.priority}
                    onValueChange={(value) => updateTicketField('priority', value)}
                  >
                    <SelectTrigger className="w-[120px] h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">
                        <Badge variant="outline" className={priorityColors.Low}>Low</Badge>
                      </SelectItem>
                      <SelectItem value="Medium">
                        <Badge variant="outline" className={priorityColors.Medium}>Medium</Badge>
                      </SelectItem>
                      <SelectItem value="High">
                        <Badge variant="outline" className={priorityColors.High}>High</Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={statusColors[ticket.status]}>
                    {ticket.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Linked Tickets */}
            <LinkedTicketsCard
              ticketId={ticket.id}
              onOpenLinkModal={() => setIsLinkModalOpen(true)}
              onLinksChanged={() => setLinkRefreshKey(prev => prev + 1)}
              key={linkRefreshKey}
            />

            {/* Linked Documents */}
            <LinkedDocumentsCard ticketId={ticket.id} />
          </div>
        </div>
      </div>

      {/* Ticket Link Modal */}
      <TicketLinkModal
        open={isLinkModalOpen}
        onOpenChange={setIsLinkModalOpen}
        currentTicketId={ticket.id}
        onLinkCreated={() => setLinkRefreshKey(prev => prev + 1)}
      />
    </MainLayout>
  )
}
