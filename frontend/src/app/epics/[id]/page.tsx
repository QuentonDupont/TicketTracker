"use client"

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
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
  Pause,
  Play,
  TrendingUp,
  Activity,
  ListTodo,
} from "lucide-react"
import { toast } from "sonner"
import { Epic, Ticket, EpicStatus } from "@/types"

const statusColors: Record<EpicStatus, string> = {
  'Planning': 'bg-gray-500 text-white',
  'In Progress': 'bg-blue-500 text-white',
  'Completed': 'bg-green-500 text-white',
  'On Hold': 'bg-yellow-500 text-white'
}

const statusIcons = {
  'Planning': Circle,
  'In Progress': Play,
  'Completed': CheckCircle,
  'On Hold': Pause
}

const ticketStatusColors = {
  'To Do': 'bg-gray-500 text-white',
  'In Progress': 'bg-blue-500 text-white',
  'Done': 'bg-green-500 text-white'
}

const priorityColors = {
  'Low': 'bg-green-100 text-green-800 border-green-200',
  'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'High': 'bg-red-100 text-red-800 border-red-200'
}

export default function EpicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [epic, setEpic] = useState<Epic | null>(null)
  const [relatedTickets, setRelatedTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadEpicAndTickets = () => {
      try {
        // Load epic
        const storedEpics = localStorage.getItem('epics')
        if (storedEpics) {
          const epics: Epic[] = JSON.parse(storedEpics)
          const found = epics.find(e => e.id === parseInt(resolvedParams.id))
          if (found) {
            setEpic(found)
          } else {
            toast.error('Epic not found')
            router.push('/epics')
            return
          }
        } else {
          toast.error('No epics found')
          router.push('/epics')
          return
        }

        // Load related tickets
        const storedTickets = localStorage.getItem('tickets')
        if (storedTickets) {
          const tickets: Ticket[] = JSON.parse(storedTickets)
          const related = tickets.filter(t => t.epic_id === parseInt(resolvedParams.id))
          setRelatedTickets(related)
        }
      } catch (error) {
        toast.error('Error loading epic')
        router.push('/epics')
      } finally {
        setIsLoading(false)
      }
    }

    loadEpicAndTickets()
  }, [resolvedParams.id, router])

  const handleStatusChange = (newStatus: EpicStatus) => {
    if (!epic) return

    try {
      const storedEpics = localStorage.getItem('epics')
      if (storedEpics) {
        const epics: Epic[] = JSON.parse(storedEpics)
        const updatedEpics = epics.map(e =>
          e.id === epic.id ? { ...e, status: newStatus } : e
        )
        localStorage.setItem('epics', JSON.stringify(updatedEpics))
        setEpic({ ...epic, status: newStatus })
        toast.success(`Status updated to ${newStatus}`)
      }
    } catch (error) {
      toast.error('Error updating status')
    }
  }

  const handleDelete = () => {
    if (!epic) return

    if (confirm('Are you sure you want to delete this epic? All associated tickets will be unlinked.')) {
      try {
        const storedEpics = localStorage.getItem('epics')
        if (storedEpics) {
          const epics: Epic[] = JSON.parse(storedEpics)
          const updatedEpics = epics.filter(e => e.id !== epic.id)
          localStorage.setItem('epics', JSON.stringify(updatedEpics))

          // Unlink tickets
          const storedTickets = localStorage.getItem('tickets')
          if (storedTickets) {
            const tickets: Ticket[] = JSON.parse(storedTickets)
            const updatedTickets = tickets.map(t =>
              t.epic_id === epic.id ? { ...t, epic_id: undefined } : t
            )
            localStorage.setItem('tickets', JSON.stringify(updatedTickets))
          }

          toast.success('Epic deleted successfully')
          router.push('/epics')
        }
      } catch (error) {
        toast.error('Error deleting epic')
      }
    }
  }

  const calculateProgress = () => {
    if (relatedTickets.length === 0) return 0
    const completedTickets = relatedTickets.filter(t => t.status === 'Done').length
    return Math.round((completedTickets / relatedTickets.length) * 100)
  }

  const getDaysRemaining = () => {
    if (!epic) return 0
    const endDate = new Date(epic.end_date)
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading epic...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!epic) {
    return null
  }

  const StatusIcon = statusIcons[epic.status]
  const progress = calculateProgress()
  const daysRemaining = getDaysRemaining()
  const completedTickets = relatedTickets.filter(t => t.status === 'Done').length
  const inProgressTickets = relatedTickets.filter(t => t.status === 'In Progress').length
  const todoTickets = relatedTickets.filter(t => t.status === 'To Do').length

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link href="/epics" className="hover:text-foreground transition-colors">
            Epics
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {epic.title}
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
              Back to Epics
            </Button>
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-8 rounded"
                style={{ backgroundColor: epic.color }}
              />
              <h1 className="text-3xl font-bold tracking-tight">{epic.title}</h1>
              <Badge className={statusColors[epic.status]}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {epic.status}
              </Badge>
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
              <DropdownMenuItem onClick={() => handleStatusChange('Planning')}>
                <Circle className="mr-2 h-4 w-4" />
                Planning
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('In Progress')}>
                <Play className="mr-2 h-4 w-4" />
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('On Hold')}>
                <Pause className="mr-2 h-4 w-4" />
                On Hold
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('Completed')}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Completed
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Epic Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => toast.info('Edit functionality coming soon')}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Epic
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Epic
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Separator />

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <ListTodo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{relatedTickets.length}</div>
              <p className="text-xs text-muted-foreground">
                {completedTickets} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progress}%</div>
              <Progress value={progress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Remaining</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{daysRemaining}</div>
              <p className="text-xs text-muted-foreground">days left</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressTickets}</div>
              <p className="text-xs text-muted-foreground">
                {todoTickets} to do
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content - Left Column (2/3 width) */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {epic.description}
                </p>
              </CardContent>
            </Card>

            {/* Related Tickets */}
            <Card>
              <CardHeader>
                <CardTitle>Related Tickets</CardTitle>
                <CardDescription>
                  {relatedTickets.length} ticket{relatedTickets.length !== 1 ? 's' : ''} in this epic
                </CardDescription>
              </CardHeader>
              <CardContent>
                {relatedTickets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ListTodo className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No tickets assigned to this epic yet</p>
                    <p className="text-xs mt-1">Create or edit tickets to link them to this epic</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {relatedTickets.map((ticket) => (
                      <Link
                        key={ticket.id}
                        href={`/tickets/${ticket.id}`}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium group-hover:text-blue-400 transition-colors">
                              {ticket.title}
                            </span>
                            <Badge variant="outline" className={priorityColors[ticket.priority]}>
                              {ticket.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {ticket.description}
                          </p>
                        </div>
                        <Badge className={ticketStatusColors[ticket.status]}>
                          {ticket.status}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline - Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
                <CardDescription>
                  Track milestones and progress over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                      <div className="w-px h-full bg-border mt-1"></div>
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium">Epic created</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(epic.created_date).toLocaleDateString()} at{' '}
                        {new Date(epic.created_date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    More milestones will appear here as the epic progresses
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
                <CardTitle className="text-base">Epic Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Owner */}
                <div className="space-y-1">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Owner
                  </label>
                  <p className="text-sm">
                    {epic.owner || <span className="text-muted-foreground">Unassigned</span>}
                  </p>
                </div>

                <Separator />

                {/* Start Date */}
                <div className="space-y-1">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Start Date
                  </label>
                  <p className="text-sm">
                    {new Date(epic.start_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <Separator />

                {/* End Date */}
                <div className="space-y-1">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    Target End Date
                  </label>
                  <p className="text-sm">
                    {new Date(epic.end_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <Separator />

                {/* Created Date */}
                <div className="space-y-1">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Created
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(epic.created_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <Separator />

                {/* Color */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    Theme Color
                  </label>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: epic.color }}
                    />
                    <span className="text-sm font-mono">{epic.color}</span>
                  </div>
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
                  <span className="text-sm text-muted-foreground">Epic ID</span>
                  <span className="text-sm font-medium">#{epic.id}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={statusColors[epic.status]}>
                    {epic.status}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tickets</span>
                  <span className="text-sm font-medium">{relatedTickets.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completion</span>
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
