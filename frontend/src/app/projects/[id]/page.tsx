"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { MainLayout } from "@/components/layout/main-layout"
import { EnhancedTicketTable } from "@/components/enhanced-ticket-table"
import { TicketForm } from "@/components/ticket-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  ArrowLeft,
  List,
  LayoutDashboard,
  Settings,
  Download,
  Upload,
  Folder,
  Calendar,
  GripVertical,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from "lucide-react"
import { toast } from "sonner"
import { Ticket, ProjectSpace } from "@/types"
import { getProjectSpaceById, getTicketCountForSpace } from "@/lib/project-storage"
import { exportTicketsToCSV } from "@/lib/csv-export"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

// Droppable Column Component
function DroppableColumn({
  status,
  title,
  color,
  children,
  count
}: {
  status: string
  title: string
  color: string
  children: React.ReactNode
  count: number
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  return (
    <div
      ref={setNodeRef}
      className={`border rounded-lg p-4 ${color} w-80 flex-shrink-0 min-h-[200px] transition-all ${
        isOver ? 'ring-2 ring-blue-600 bg-blue-50/50 dark:bg-blue-950/50 scale-[1.02]' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          {title}
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
        </h3>
      </div>
      {children}
    </div>
  )
}

// Draggable Ticket Card Component
function DraggableTicketCard({ ticket, onEdit, onDelete }: {
  ticket: Ticket
  onEdit: (ticket: Ticket) => void
  onDelete: (ticketId: number) => void
}) {
  const router = useRouter()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: ticket.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'Live' || status === 'Ready to Release') return false
    const due = new Date(dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return due < today
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer hover:shadow-md transition-shadow ${isSortableDragging ? 'shadow-lg ring-2 ring-blue-600' : ''}`}
      onClick={() => router.push(`/tickets/${ticket.id}`)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            {/* Drag Handle */}
            <button
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground mt-0.5"
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4" />
            </button>

            <Link
              href={`/tickets/${ticket.id}`}
              onClick={(e) => e.stopPropagation()}
              className="font-medium text-sm leading-tight hover:text-blue-400 hover:underline transition-colors flex-1"
            >
              {ticket.title}
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/tickets/${ticket.id}`)
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(ticket)
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Ticket
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(ticket.id)
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 pl-6">
            {ticket.description}
          </p>

          <div className="flex items-center justify-between pl-6">
            <Badge className={priorityColors[ticket.priority]} variant="outline">
              {ticket.priority}
            </Badge>
            {isOverdue(ticket.due_date, ticket.status) && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pl-6">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(ticket.due_date).toLocaleDateString()}
            </div>
            {ticket.assignee && (
              <span className="truncate max-w-20">
                {ticket.assignee}
              </span>
            )}
          </div>

          {ticket.tags && ticket.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap pl-6">
              {ticket.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
              {ticket.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  +{ticket.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function KanbanBoard({ tickets, onEdit, onDelete, onView, onStatusChange }: {
  tickets: Ticket[]
  onEdit: (ticket: Ticket) => void
  onDelete: (ticketId: number) => void
  onView: (ticket: Ticket) => void
  onStatusChange: (ticketId: number, newStatus: Ticket['status']) => void
}) {
  const [activeId, setActiveId] = useState<number | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const columns = [
    { status: 'To Do' as const, title: 'To Do', color: 'border-gray-200' },
    { status: 'In Progress' as const, title: 'In Progress', color: 'border-blue-200' },
    { status: 'Ready for Code Review' as const, title: 'Ready for Code Review', color: 'border-blue-200' },
    { status: 'Ready For QA' as const, title: 'Ready For QA', color: 'border-orange-200' },
    { status: 'In QA' as const, title: 'In QA', color: 'border-yellow-200' },
    { status: 'Ready to Release' as const, title: 'Ready to Release', color: 'border-indigo-200' },
    { status: 'Live' as const, title: 'Live', color: 'border-green-200' }
  ]

  const getTicketsByStatus = (status: Ticket['status']) => {
    return tickets.filter(ticket => ticket.status === status)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number)
  }

  const handleDragOver = (event: DragOverEvent) => {
    // Visual feedback handled by DroppableColumn
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const ticketId = active.id as number
    const activeTicket = tickets.find(t => t.id === ticketId)

    if (!activeTicket) return

    const overId = over.id
    const isColumnDrop = columns.some(col => col.status === overId)

    if (isColumnDrop) {
      const newStatus = overId as Ticket['status']
      if (activeTicket.status !== newStatus) {
        onStatusChange(ticketId, newStatus)
        toast.success(`Ticket moved to ${newStatus}`)
      }
    } else {
      const overTicket = tickets.find(t => t.id === overId)
      if (overTicket && activeTicket.status !== overTicket.status) {
        onStatusChange(ticketId, overTicket.status)
        toast.success(`Ticket moved to ${overTicket.status}`)
      }
    }
  }

  const activeTicket = activeId ? tickets.find(t => t.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {columns.map((column) => {
            const columnTickets = getTicketsByStatus(column.status)
            return (
              <SortableContext
                key={column.status}
                id={column.status}
                items={columnTickets.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <DroppableColumn
                  status={column.status}
                  title={column.title}
                  color={column.color}
                  count={columnTickets.length}
                >
                  <div className="space-y-3">
                    {columnTickets.map((ticket) => (
                      <DraggableTicketCard
                        key={ticket.id}
                        ticket={ticket}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    ))}
                  </div>
                </DroppableColumn>
              </SortableContext>
            )
          })}
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTicket ? (
          <Card className="cursor-grabbing shadow-2xl ring-2 ring-blue-600 w-80">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="font-medium text-sm leading-tight flex-1">
                    {activeTicket.title}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 pl-6">
                  {activeTicket.description}
                </p>
                <Badge className={priorityColors[activeTicket.priority]} variant="outline">
                  {activeTicket.priority}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

function TicketStats({ tickets }: { tickets: Ticket[] }) {
  const stats = {
    total: tickets.length,
    todo: tickets.filter(t => t.status === 'To Do').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    readyForCodeReview: tickets.filter(t => t.status === 'Ready for Code Review').length,
    readyForQA: tickets.filter(t => t.status === 'Ready For QA').length,
    inQA: tickets.filter(t => t.status === 'In QA').length,
    readyToRelease: tickets.filter(t => t.status === 'Ready to Release').length,
    live: tickets.filter(t => t.status === 'Live').length,
    overdue: tickets.filter(t => {
      const due = new Date(t.due_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return due < today && t.status !== 'Live' && t.status !== 'Ready to Release'
    }).length
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4 mb-6">
      <div className="text-center">
        <div className="text-2xl font-bold">{stats.total}</div>
        <div className="text-sm text-muted-foreground">Total</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-600">{stats.todo}</div>
        <div className="text-sm text-muted-foreground">To Do</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
        <div className="text-sm text-muted-foreground">In Progress</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{stats.readyForCodeReview}</div>
        <div className="text-sm text-muted-foreground">Code Review</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-600">{stats.readyForQA}</div>
        <div className="text-sm text-muted-foreground">Ready For QA</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-yellow-600">{stats.inQA}</div>
        <div className="text-sm text-muted-foreground">In QA</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-indigo-600">{stats.readyToRelease}</div>
        <div className="text-sm text-muted-foreground">To Release</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{stats.live}</div>
        <div className="text-sm text-muted-foreground">Live</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
        <div className="text-sm text-muted-foreground">Overdue</div>
      </div>
    </div>
  )
}

export default function ProjectSpaceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectSpaceId = parseInt(params.id as string)

  const [projectSpace, setProjectSpace] = useState<ProjectSpace | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const [isLoading, setIsLoading] = useState(true)

  // Load project space and tickets
  useEffect(() => {
    const loadData = () => {
      try {
        // Load project space
        const space = getProjectSpaceById(projectSpaceId)
        if (!space) {
          toast.error('Project space not found')
          router.push('/dashboard')
          return
        }
        setProjectSpace(space)

        // Load tickets for this project space
        const storedTickets = localStorage.getItem('tickets')
        if (storedTickets) {
          const allTickets: Ticket[] = JSON.parse(storedTickets)
          const filteredTickets = allTickets.filter(t => t.project_space_id === projectSpaceId)
          setTickets(filteredTickets)
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Error loading project space data:', error)
        toast.error('Failed to load project space')
        setIsLoading(false)
      }
    }

    loadData()
  }, [projectSpaceId, router])

  // Save tickets to localStorage whenever they change
  useEffect(() => {
    if (tickets.length > 0 && !isLoading) {
      const storedTickets = localStorage.getItem('tickets')
      if (storedTickets) {
        const allTickets: Ticket[] = JSON.parse(storedTickets)
        // Update tickets for this project space
        const otherTickets = allTickets.filter(t => t.project_space_id !== projectSpaceId)
        const updatedTickets = [...otherTickets, ...tickets]
        localStorage.setItem('tickets', JSON.stringify(updatedTickets))
      }
    }
  }, [tickets, projectSpaceId, isLoading])

  const handleCreateTicket = (ticketData: any) => {
    const newTicket: Ticket = {
      id: Date.now(),
      ...ticketData,
      created_date: new Date().toISOString().split('T')[0],
      project_space_id: projectSpaceId, // Assign to this project space
    }
    setTickets(prev => [newTicket, ...prev])

    // Update localStorage with all tickets
    const storedTickets = localStorage.getItem('tickets')
    if (storedTickets) {
      const allTickets: Ticket[] = JSON.parse(storedTickets)
      allTickets.push(newTicket)
      localStorage.setItem('tickets', JSON.stringify(allTickets))
    }

    setIsCreateDialogOpen(false)
    toast.success('Ticket created successfully!')
  }

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket)
  }

  const handleUpdateTicket = (ticketData: any) => {
    if (editingTicket) {
      setTickets(prev => prev.map(t =>
        t.id === editingTicket.id ? { ...t, ...ticketData } : t
      ))
      setEditingTicket(null)
      toast.success('Ticket updated successfully!')
    }
  }

  const handleDeleteTicket = (ticketId: number) => {
    setTickets(prev => prev.filter(t => t.id !== ticketId))

    // Update localStorage
    const storedTickets = localStorage.getItem('tickets')
    if (storedTickets) {
      const allTickets: Ticket[] = JSON.parse(storedTickets)
      const updatedTickets = allTickets.filter(t => t.id !== ticketId)
      localStorage.setItem('tickets', JSON.stringify(updatedTickets))
    }

    toast.success('Ticket deleted successfully!')
  }

  const handleViewTicket = (ticket: Ticket) => {
    router.push(`/tickets/${ticket.id}`)
  }

  const handleStatusChange = (ticketId: number, newStatus: Ticket['status']) => {
    setTickets(prev => prev.map(t =>
      t.id === ticketId ? { ...t, status: newStatus } : t
    ))
  }

  const handleBulkAction = (action: string) => {
    if (action === 'export' && projectSpace) {
      exportTicketsToCSV(tickets, `${projectSpace.name}-tickets.csv`)
      toast.success(`Exported ${tickets.length} ticket${tickets.length === 1 ? '' : 's'} to CSV`)
    } else {
      toast.info(`Bulk ${action} action triggered`)
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Loading project space...</div>
        </div>
      </MainLayout>
    )
  }

  if (!projectSpace) {
    return null
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        {/* Header with Back Button */}
        <div className="space-y-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              {/* Project Space Icon */}
              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: `${projectSpace.color}20`,
                  color: projectSpace.color
                }}
              >
                <Folder className="h-8 w-8" />
              </div>

              {/* Project Space Info */}
              <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  {projectSpace.name}
                  <Badge
                    variant="outline"
                    className="text-sm"
                    style={{
                      borderColor: projectSpace.color,
                      color: projectSpace.color
                    }}
                  >
                    {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
                  </Badge>
                </h1>
                {projectSpace.description && (
                  <p className="text-muted-foreground mt-2">
                    {projectSpace.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Created {new Date(projectSpace.created_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex rounded-md border">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('kanban')}
                >
                  <LayoutDashboard className="h-4 w-4" />
                </Button>
              </div>

              {/* Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleBulkAction('export')}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Tickets
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('import')}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Tickets
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Create Ticket Button */}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Ticket in {projectSpace.name}</DialogTitle>
                  </DialogHeader>
                  <TicketForm onSubmit={handleCreateTicket} mode="create" />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Stats */}
        <TicketStats tickets={tickets} />

        {/* Content */}
        {tickets.length === 0 ? (
          <Card className="glass">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Folder className="h-16 w-16 text-muted-foreground mb-4" style={{ color: projectSpace.color }} />
              <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by creating your first ticket for this project space.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Ticket
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {viewMode === 'list' ? (
              <EnhancedTicketTable
                tickets={tickets}
                onEdit={handleEditTicket}
                onDelete={handleDeleteTicket}
                onView={handleViewTicket}
              />
            ) : (
              <KanbanBoard
                tickets={tickets}
                onEdit={handleEditTicket}
                onDelete={handleDeleteTicket}
                onView={handleViewTicket}
                onStatusChange={handleStatusChange}
              />
            )}
          </div>
        )}

        {/* Edit Ticket Dialog */}
        <Dialog open={!!editingTicket} onOpenChange={(open) => !open && setEditingTicket(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Ticket</DialogTitle>
            </DialogHeader>
            {editingTicket && (
              <TicketForm
                initialData={editingTicket}
                onSubmit={handleUpdateTicket}
                mode="edit"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
