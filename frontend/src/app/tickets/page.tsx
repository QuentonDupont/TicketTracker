"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MainLayout } from "@/components/layout/main-layout"
import { EnhancedTicketTable } from "@/components/enhanced-ticket-table"
import { TicketForm } from "@/components/ticket-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
  Plus,
  Calendar,
  List,
  LayoutDashboard,
  Filter,
  MoreHorizontal,
  Download,
  Upload,
  Settings,
  Eye,
  Edit,
  Trash2,
  GripVertical
} from "lucide-react"
import { toast } from "sonner"
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
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Ticket {
  id: number
  title: string
  description: string
  current_results: string
  expected_results: string
  status: 'To Do' | 'In Progress' | 'Ready for Code Review' | 'Ready For QA' | 'In QA' | 'Ready to Release' | 'Live'
  priority: 'Low' | 'Medium' | 'High'
  due_date: string
  created_date: string
  assignee?: string
  tags?: string[]
}

const initialTickets: Ticket[] = [
  {
    id: 1,
    title: "Implement user authentication",
    description: "Set up JWT-based authentication system with secure token handling and session management",
    current_results: "Users can access all pages without authentication. No login system exists.",
    expected_results: "Users must authenticate via JWT tokens. Protected routes redirect to login page.",
    status: "In Progress",
    priority: "High",
    due_date: "2025-01-15",
    created_date: "2025-01-01",
    assignee: "Alice Johnson",
    tags: ["backend", "security", "authentication"]
  },
  {
    id: 2,
    title: "Design dashboard UI",
    description: "Create responsive dashboard interface with modern design patterns and accessibility features",
    current_results: "Dashboard displays basic metrics in a simple table layout without visualization.",
    expected_results: "Dashboard shows interactive charts, graphs, and cards with real-time data updates.",
    status: "Done",
    priority: "Medium",
    due_date: "2025-01-10",
    created_date: "2024-12-28",
    assignee: "Bob Wilson",
    tags: ["frontend", "ui", "design"]
  },
  {
    id: 3,
    title: "Set up database schema",
    description: "Design and implement comprehensive database structure with proper indexing and relationships",
    current_results: "No database schema exists. Data is stored in memory and lost on restart.",
    expected_results: "PostgreSQL database with normalized schema, indexes, and migration scripts.",
    status: "To Do",
    priority: "High",
    due_date: "2025-01-20",
    created_date: "2025-01-02",
    assignee: "Charlie Brown",
    tags: ["database", "schema", "backend"]
  },
  {
    id: 4,
    title: "API documentation",
    description: "Create comprehensive API documentation using OpenAPI/Swagger with examples",
    current_results: "API endpoints are undocumented. Developers rely on code comments.",
    expected_results: "Complete Swagger UI with request/response examples and authentication details.",
    status: "To Do",
    priority: "Low",
    due_date: "2025-02-01",
    created_date: "2025-01-03",
    tags: ["documentation", "api"]
  },
  {
    id: 5,
    title: "Performance optimization",
    description: "Optimize application performance and implement caching strategies",
    current_results: "Page load times exceed 3 seconds. No caching implemented.",
    expected_results: "Page loads in under 1 second with Redis caching and optimized queries.",
    status: "In Progress",
    priority: "Medium",
    due_date: "2025-01-25",
    created_date: "2025-01-04",
    assignee: "Diana Prince",
    tags: ["performance", "optimization", "caching"]
  },
  {
    id: 6,
    title: "Test Playwright Integration",
    description: "Testing the new modern UI with Playwright automation to ensure all components work correctly",
    current_results: "Manual testing only. No automated E2E tests.",
    expected_results: "Full Playwright test suite covering critical user flows with CI/CD integration.",
    status: "To Do",
    priority: "High",
    due_date: "2025-12-31",
    created_date: "2025-01-05",
    tags: ["testing", "automation"]
  }
]

const statusColors = {
  'To Do': 'bg-gray-500 text-white',
  'In Progress': 'bg-blue-500 text-white',
  'Ready for Code Review': 'bg-purple-500 text-white',
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
        isOver ? 'ring-2 ring-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/50 scale-[1.02]' : ''
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
function DraggableTicketCard({ ticket, onEdit, onDelete, isDragging }: {
  ticket: Ticket
  onEdit: (ticket: Ticket) => void
  onDelete: (ticketId: number) => void
  isDragging?: boolean
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
      className={`cursor-pointer hover:shadow-md transition-shadow ${isSortableDragging ? 'shadow-lg ring-2 ring-cyan-500' : ''}`}
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
              className="font-medium text-sm leading-tight hover:text-cyan-400 hover:underline transition-colors flex-1"
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
        distance: 8, // Require 8px of movement before drag starts
      },
    })
  )

  const columns = [
    { status: 'To Do' as const, title: 'To Do', color: 'border-gray-200' },
    { status: 'In Progress' as const, title: 'In Progress', color: 'border-blue-200' },
    { status: 'Ready for Code Review' as const, title: 'Ready for Code Review', color: 'border-purple-200' },
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
    const { over } = event
    if (!over) return

    // Visual feedback is handled by DroppableColumn's isOver state
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const ticketId = active.id as number
    const activeTicket = tickets.find(t => t.id === ticketId)

    if (!activeTicket) return

    // Determine if we're dropping on a column or another ticket
    // Column IDs are status strings, ticket IDs are numbers
    const overId = over.id

    // Check if overId is a valid status (column drop)
    const isColumnDrop = columns.some(col => col.status === overId)

    if (isColumnDrop) {
      // Dropped on a column - change status
      const newStatus = overId as Ticket['status']
      if (activeTicket.status !== newStatus) {
        onStatusChange(ticketId, newStatus)
        toast.success(`Ticket moved to ${newStatus}`)
      }
    } else {
      // Dropped on another ticket - find which column it belongs to
      const overTicket = tickets.find(t => t.id === overId)
      if (overTicket && activeTicket.status !== overTicket.status) {
        // Change to the same status as the ticket we dropped on
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
          <Card className="cursor-grabbing shadow-2xl ring-2 ring-cyan-500 w-80">
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
        <div className="text-2xl font-bold text-purple-600">{stats.readyForCodeReview}</div>
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

export default function TicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')

  // Load tickets from localStorage on mount
  useEffect(() => {
    const storedTickets = localStorage.getItem('tickets')
    if (storedTickets) {
      setTickets(JSON.parse(storedTickets))
    } else {
      // Initialize with default tickets if none exist
      localStorage.setItem('tickets', JSON.stringify(initialTickets))
      setTickets(initialTickets)
    }
  }, [])

  // Save tickets to localStorage whenever they change
  useEffect(() => {
    if (tickets.length > 0) {
      localStorage.setItem('tickets', JSON.stringify(tickets))
    }
  }, [tickets])

  const handleCreateTicket = (ticketData: any) => {
    const newTicket: Ticket = {
      id: Date.now(),
      ...ticketData,
      created_date: new Date().toISOString().split('T')[0],
    }
    setTickets(prev => [newTicket, ...prev])
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
    // Placeholder for bulk actions
    toast.info(`Bulk ${action} action triggered`)
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
            <p className="text-muted-foreground">
              Manage and track all your tickets with advanced filtering and organization
            </p>
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
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Templates</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleBulkAction('bug-template')}>
                  Bug Report Template
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('feature-template')}>
                  Feature Request Template
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Create Ticket Button */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Ticket</DialogTitle>
                </DialogHeader>
                <TicketForm onSubmit={handleCreateTicket} mode="create" />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <TicketStats tickets={tickets} />

        {/* Content */}
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