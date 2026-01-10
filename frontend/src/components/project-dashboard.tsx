"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { Plus, Calendar, Clock, User, DollarSign, Target, AlertCircle, Sparkles, Zap } from "lucide-react"
import { TicketForm } from "./ticket-form"
import { EnhancedTicketTable } from "./enhanced-ticket-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"

// Types for our data
interface Ticket {
  id: number
  title: string
  description: string
  status: 'To Do' | 'In Progress' | 'Done'
  priority: 'Low' | 'Medium' | 'High'
  due_date: string
  created_date: string
  assignee?: string
  tags?: string[]
}

interface Project {
  id: number
  name: string
  description: string
  start_date: string
  end_date: string
  budget: number
  manager: string
  status: 'Active' | 'Completed' | 'On Hold'
}

interface TeamMember {
  id: number
  name: string
  role: string
  skills: string[]
  availability: number
  cost_rate: number
}

// Mock data - in real app this would come from API
const initialMockTickets: Ticket[] = [
  {
    id: 1,
    title: "Implement user authentication",
    description: "Set up JWT-based authentication system with secure token handling and session management",
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
    status: "In Progress",
    priority: "Medium",
    due_date: "2025-01-25",
    created_date: "2025-01-04",
    assignee: "Diana Prince",
    tags: ["performance", "optimization", "caching"]
  }
]

const mockProjects: Project[] = [
  {
    id: 1,
    name: "Project Management System",
    description: "Complete project tracking solution",
    start_date: "2024-01-01",
    end_date: "2024-03-31",
    budget: 50000,
    manager: "John Doe",
    status: "Active"
  },
  {
    id: 2,
    name: "E-commerce Platform",
    description: "Online shopping platform",
    start_date: "2023-10-01",
    end_date: "2024-02-28",
    budget: 100000,
    manager: "Jane Smith",
    status: "Active"
  }
]

const mockTeamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Alice Johnson",
    role: "Frontend Developer",
    skills: ["React", "TypeScript", "CSS"],
    availability: 85,
    cost_rate: 75
  },
  {
    id: 2,
    name: "Bob Wilson",
    role: "Backend Developer",
    skills: ["Python", "Django", "PostgreSQL"],
    availability: 90,
    cost_rate: 80
  }
]

const statusColors = {
  'To Do': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  'In Progress': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'Done': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
}

const priorityColors = {
  'Low': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Medium': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'High': 'bg-red-500/20 text-red-300 border-red-500/30'
}

function DashboardMetrics({ tickets }: { tickets: Ticket[] }) {
  const totalTickets = tickets.length
  const openTickets = tickets.filter(t => t.status !== 'Done').length
  const completedTickets = tickets.filter(t => t.status === 'Done').length
  const totalProjects = mockProjects.length

  const metrics = [
    {
      title: "Total Tickets",
      value: totalTickets,
      icon: Target,
      color: "from-cyan-500 to-blue-500",
      glow: "glow-cyan"
    },
    {
      title: "Open Tickets", 
      value: openTickets,
      icon: AlertCircle,
      color: "from-yellow-500 to-orange-500",
      glow: "glow-purple"
    },
    {
      title: "Completed",
      value: completedTickets,
      icon: Clock,
      color: "from-emerald-500 to-green-500",
      glow: "glow-cyan"
    },
    {
      title: "Active Projects",
      value: totalProjects,
      icon: DollarSign,
      color: "from-purple-500 to-pink-500",
      glow: "glow-purple"
    }
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon
        return (
          <Card key={index} className="glass card-hover hover-lift group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground/90">{metric.title}</CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${metric.color} ${metric.glow} group-hover:scale-110 transition-transform duration-300`}>
                <IconComponent className="h-4 w-4 text-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">{metric.value}</div>
              <p className="text-xs text-muted-foreground/60">Active work items</p>
              <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${metric.color} transition-all duration-1000 ease-out`}
                  style={{ width: `${(metric.value / Math.max(...metrics.map(m => m.value))) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function TicketsChart({ tickets }: { tickets: Ticket[] }) {
  const statusData = [
    { name: 'To Do', value: tickets.filter(t => t.status === 'To Do').length, color: '#6b7280' },
    { name: 'In Progress', value: tickets.filter(t => t.status === 'In Progress').length, color: '#22d3ee' },
    { name: 'Done', value: tickets.filter(t => t.status === 'Done').length, color: '#10b981' }
  ]

  const priorityData = [
    { name: 'Low', value: tickets.filter(t => t.priority === 'Low').length },
    { name: 'Medium', value: tickets.filter(t => t.priority === 'Medium').length },
    { name: 'High', value: tickets.filter(t => t.priority === 'High').length }
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="glass card-hover">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            Tickets by Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: {
                label: "Count",
              },
            }}
            className="h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="glass card-hover">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-400" />
            Tickets by Priority
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: {
                label: "Count",
              },
            }}
            className="h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Bar dataKey="value" fill="#a855f7" />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function TicketTable() {
  return (
    <Card className="glass card-hover">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Target className="h-5 w-5 text-cyan-400" />
          Recent Tickets
        </CardTitle>
        <CardDescription className="text-muted-foreground">Latest tickets in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead className="text-foreground/90">Title</TableHead>
              <TableHead className="text-foreground/90">Status</TableHead>
              <TableHead className="text-foreground/90">Priority</TableHead>
              <TableHead className="text-foreground/90">Due Date</TableHead>
              <TableHead className="text-foreground/90">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialMockTickets.map((ticket) => (
              <TableRow key={ticket.id} className="border-border/50 hover:bg-muted/50 transition-colors">
                <TableCell>
                  <div>
                    <div className="font-medium text-foreground">{ticket.title}</div>
                    <div className="text-sm text-muted-foreground/60">{ticket.description}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${statusColors[ticket.status]} border`}>
                    {ticket.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`${priorityColors[ticket.priority]} border`}>
                    {ticket.priority}
                  </Badge>
                </TableCell>
                <TableCell className="text-foreground/90">{new Date(ticket.due_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function ProjectTable() {
  return (
    <Card className="glass card-hover">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-purple-400" />
          Active Projects
        </CardTitle>
        <CardDescription className="text-muted-foreground">Current projects in development</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead className="text-foreground/90">Project Name</TableHead>
              <TableHead className="text-foreground/90">Manager</TableHead>
              <TableHead className="text-foreground/90">Budget</TableHead>
              <TableHead className="text-foreground/90">Timeline</TableHead>
              <TableHead className="text-foreground/90">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockProjects.map((project) => (
              <TableRow key={project.id} className="border-border/50 hover:bg-muted/50 transition-colors">
                <TableCell>
                  <div>
                    <div className="font-medium text-foreground">{project.name}</div>
                    <div className="text-sm text-muted-foreground/60">{project.description}</div>
                  </div>
                </TableCell>
                <TableCell className="flex items-center gap-2 text-foreground/90">
                  <User className="h-4 w-4" />
                  {project.manager}
                </TableCell>
                <TableCell className="flex items-center gap-2 text-foreground/90">
                  <DollarSign className="h-4 w-4" />
                  ${project.budget.toLocaleString()}
                </TableCell>
                <TableCell className="flex items-center gap-2 text-foreground/90">
                  <Calendar className="h-4 w-4" />
                  {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 border">
                    {project.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function TeamTable() {
  return (
    <Card className="glass card-hover">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <User className="h-5 w-5 text-cyan-400" />
          Team Members
        </CardTitle>
        <CardDescription className="text-muted-foreground">Development team and their availability</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead className="text-foreground/90">Name</TableHead>
              <TableHead className="text-foreground/90">Role</TableHead>
              <TableHead className="text-foreground/90">Skills</TableHead>
              <TableHead className="text-foreground/90">Availability</TableHead>
              <TableHead className="text-foreground/90">Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTeamMembers.map((member) => (
              <TableRow key={member.id} className="border-border/50 hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium text-foreground">{member.name}</TableCell>
                <TableCell className="text-foreground/90">{member.role}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {member.skills.map((skill, index) => (
                      <Badge key={index} className="bg-muted text-foreground/80 border-border text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={member.availability} className="w-16" />
                    <span className="text-sm text-foreground/90">{member.availability}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-foreground/90">${member.cost_rate}/hr</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function ProjectDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>(initialMockTickets)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null)

  const handleCreateTicket = (ticketData: any) => {
    const newTicket: Ticket = {
      id: Date.now(), // In real app, this would come from backend
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
    setViewingTicket(ticket)
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gradient text-glow">
            Project Management Dashboard
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            Track your projects, tickets, and team performance with advanced analytics
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-foreground font-medium px-6 py-2.5 glow-gradient hover-lift btn-glow">
              <Plus className="h-4 w-4 mr-2" />
              Add New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl glass border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Ticket</DialogTitle>
            </DialogHeader>
            <TicketForm onSubmit={handleCreateTicket} mode="create" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Metrics */}
      <DashboardMetrics tickets={tickets} />

      {/* Charts */}
      <TicketsChart tickets={tickets} />

      {/* Tabs for different sections */}
      <Tabs defaultValue="tickets" className="space-y-6">
        <TabsList className="glass border-border">
          <TabsTrigger value="tickets" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-foreground">
            Tickets
          </TabsTrigger>
          <TabsTrigger value="projects" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-foreground">
            Projects
          </TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-foreground">
            Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-6">
          <EnhancedTicketTable
            tickets={tickets}
            onEdit={handleEditTicket}
            onDelete={handleDeleteTicket}
            onView={handleViewTicket}
          />
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <ProjectTable />
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <TeamTable />
        </TabsContent>
      </Tabs>

      {/* Edit Ticket Dialog */}
      <Dialog open={!!editingTicket} onOpenChange={(open) => !open && setEditingTicket(null)}>
        <DialogContent className="max-w-2xl glass border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Ticket</DialogTitle>
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

      {/* View Ticket Dialog */}
      <Dialog open={!!viewingTicket} onOpenChange={(open) => !open && setViewingTicket(null)}>
        <DialogContent className="max-w-2xl glass border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Ticket Details</DialogTitle>
          </DialogHeader>
          {viewingTicket && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold text-foreground">{viewingTicket.title}</h3>
                <Badge className={`${statusColors[viewingTicket.status]} border`}>
                  {viewingTicket.status}
                </Badge>
                <Badge className={`${priorityColors[viewingTicket.priority]} border`}>
                  {viewingTicket.priority}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground/90">Description</Label>
                <p className="text-sm text-foreground/80 bg-muted/50 p-3 rounded border border-border/50">
                  {viewingTicket.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground/90">Due Date</Label>
                  <p className="text-sm text-foreground/80">{new Date(viewingTicket.due_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-foreground/90">Created Date</Label>
                  <p className="text-sm text-foreground/80">{new Date(viewingTicket.created_date).toLocaleDateString()}</p>
                </div>
              </div>

              {viewingTicket.assignee && (
                <div>
                  <Label className="text-foreground/90">Assignee</Label>
                  <p className="text-sm text-foreground/80">{viewingTicket.assignee}</p>
                </div>
              )}

              {viewingTicket.tags && viewingTicket.tags.length > 0 && (
                <div>
                  <Label className="text-foreground/90">Tags</Label>
                  <div className="flex gap-2 mt-1">
                    {viewingTicket.tags.map((tag, index) => (
                      <Badge key={index} className="bg-muted text-foreground/80 border-border">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
