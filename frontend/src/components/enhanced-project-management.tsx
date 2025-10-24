"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  DollarSign,
  User,
  MapPin,
  Clock,
  Target,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Building,
  Users
} from "lucide-react"
import { toast } from "sonner"

interface Project {
  id: number
  name: string
  description: string
  start_date: string
  end_date: string
  budget: number
  spent?: number
  manager: string
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled'
  team_size?: number
  progress?: number
  priority: 'Low' | 'Medium' | 'High'
}

interface ProjectFormData {
  name: string
  description: string
  start_date: string
  end_date: string
  budget: number
  manager: string
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled'
  priority: 'Low' | 'Medium' | 'High'
}

const mockProjects: Project[] = [
  {
    id: 1,
    name: "TicketTracker Platform",
    description: "Complete project management solution with advanced analytics and reporting capabilities",
    start_date: "2024-12-01",
    end_date: "2025-03-31",
    budget: 75000,
    spent: 25000,
    manager: "Alice Johnson",
    status: "Active",
    team_size: 6,
    progress: 35,
    priority: "High"
  },
  {
    id: 2,
    name: "Mobile Application",
    description: "Cross-platform mobile app for project tracking and team collaboration",
    start_date: "2025-01-15",
    end_date: "2025-06-30",
    budget: 50000,
    spent: 5000,
    manager: "Bob Wilson",
    status: "Planning",
    team_size: 4,
    progress: 10,
    priority: "Medium"
  },
  {
    id: 3,
    name: "Integration Suite",
    description: "Third-party integrations with popular tools like Jira, Slack, and Microsoft Teams",
    start_date: "2024-10-01",
    end_date: "2025-01-15",
    budget: 30000,
    spent: 28000,
    manager: "Charlie Brown",
    status: "Active",
    team_size: 3,
    progress: 85,
    priority: "High"
  },
  {
    id: 4,
    name: "Analytics Dashboard",
    description: "Advanced reporting and analytics module with customizable dashboards",
    start_date: "2025-02-01",
    end_date: "2025-05-31",
    budget: 40000,
    spent: 0,
    manager: "Diana Prince",
    status: "Planning",
    team_size: 3,
    progress: 5,
    priority: "Medium"
  }
]

const statusColors = {
  'Planning': 'bg-blue-100 text-blue-800 border-blue-200',
  'Active': 'bg-green-100 text-green-800 border-green-200',
  'On Hold': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Completed': 'bg-green-100 text-green-800 border-green-200',
  'Cancelled': 'bg-red-100 text-red-800 border-red-200'
}

const priorityColors = {
  'Low': 'bg-gray-100 text-gray-800 border-gray-200',
  'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'High': 'bg-red-100 text-red-800 border-red-200'
}

const statusIcons = {
  'Planning': <Clock className="h-4 w-4" />,
  'Active': <TrendingUp className="h-4 w-4" />,
  'On Hold': <AlertTriangle className="h-4 w-4" />,
  'Completed': <CheckCircle className="h-4 w-4" />,
  'Cancelled': <Target className="h-4 w-4" />
}

function ProjectForm({ onSubmit, initialData, mode = 'create' }: {
  onSubmit: (data: ProjectFormData) => void
  initialData?: Partial<ProjectFormData>
  mode?: 'create' | 'edit'
}) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
    budget: initialData?.budget || 0,
    manager: initialData?.manager || '',
    status: initialData?.status || 'Planning',
    priority: initialData?.priority || 'Medium'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required'
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required'
    }

    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date)
      const end = new Date(formData.end_date)
      if (start >= end) {
        newErrors.end_date = 'End date must be after start date'
      }
    }

    if (formData.budget <= 0) {
      newErrors.budget = 'Budget must be greater than 0'
    }

    if (!formData.manager.trim()) {
      newErrors.manager = 'Project manager is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
      if (mode === 'create') {
        setFormData({
          name: '',
          description: '',
          start_date: '',
          end_date: '',
          budget: 0,
          manager: '',
          status: 'Planning',
          priority: 'Medium'
        })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Project Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter project name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the project objectives and scope"
            rows={3}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date *</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
            className={errors.start_date ? 'border-red-500' : ''}
          />
          {errors.start_date && <p className="text-sm text-red-500">{errors.start_date}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">End Date *</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
            className={errors.end_date ? 'border-red-500' : ''}
          />
          {errors.end_date && <p className="text-sm text-red-500">{errors.end_date}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget">Budget *</Label>
          <Input
            id="budget"
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
            placeholder="0"
            min="0"
            step="1000"
            className={errors.budget ? 'border-red-500' : ''}
          />
          {errors.budget && <p className="text-sm text-red-500">{errors.budget}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="manager">Project Manager *</Label>
          <Select
            value={formData.manager}
            onValueChange={(value) => setFormData(prev => ({ ...prev, manager: value }))}
          >
            <SelectTrigger className={errors.manager ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select project manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Alice Johnson">Alice Johnson</SelectItem>
              <SelectItem value="Bob Wilson">Bob Wilson</SelectItem>
              <SelectItem value="Charlie Brown">Charlie Brown</SelectItem>
              <SelectItem value="Diana Prince">Diana Prince</SelectItem>
              <SelectItem value="Eve Adams">Eve Adams</SelectItem>
            </SelectContent>
          </Select>
          {errors.manager && <p className="text-sm text-red-500">{errors.manager}</p>}
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Planning">Planning</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low Priority</SelectItem>
              <SelectItem value="Medium">Medium Priority</SelectItem>
              <SelectItem value="High">High Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          <Building className="h-4 w-4 mr-2" />
          {mode === 'create' ? 'Create Project' : 'Update Project'}
        </Button>
        <Button type="button" variant="outline" onClick={() => {
          setFormData({
            name: '',
            description: '',
            start_date: '',
            end_date: '',
            budget: 0,
            manager: '',
            status: 'Planning',
            priority: 'Medium'
          })
          setErrors({})
        }}>
          Clear
        </Button>
      </div>
    </form>
  )
}

function ProjectMetrics({ projects }: { projects: Project[] }) {
  const activeProjects = projects.filter(p => p.status === 'Active').length
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)
  const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0)
  const completedProjects = projects.filter(p => p.status === 'Completed').length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeProjects}</div>
          <p className="text-xs text-muted-foreground">Currently in progress</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Across all projects</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Spent</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {totalBudget > 0 ? `${Math.round((totalSpent / totalBudget) * 100)}%` : '0%'} of budget
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedProjects}</div>
          <p className="text-xs text-muted-foreground">Successfully finished</p>
        </CardContent>
      </Card>
    </div>
  )
}

function ProjectTable({ projects, onEdit, onDelete, onView }: {
  projects: Project[]
  onEdit: (project: Project) => void
  onDelete: (projectId: number) => void
  onView: (project: Project) => void
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Project Portfolio
        </CardTitle>
        <CardDescription>
          Manage and track all your projects with detailed insights
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Planning">Planning</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {statusIcons[project.status]}
                        <span className="font-medium">{project.name}</span>
                        <Badge variant="outline" className={priorityColors[project.priority]}>
                          {project.priority}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {project.description.length > 80
                          ? `${project.description.substring(0, 80)}...`
                          : project.description
                        }
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {project.manager}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[project.status]}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Progress value={project.progress} className="w-16" />
                      <span className="text-sm text-muted-foreground">
                        {project.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        ${project.budget.toLocaleString()}
                      </div>
                      {project.spent !== undefined && (
                        <div className="text-xs text-muted-foreground">
                          Spent: ${project.spent.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(project.start_date).toLocaleDateString()}</div>
                      <div className="text-muted-foreground">
                        to {new Date(project.end_date).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onView(project)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(project)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Project
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(project.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-8">
            <Building className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No projects found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function EnhancedProjectManagement() {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [viewingProject, setViewingProject] = useState<Project | null>(null)

  const handleCreateProject = (projectData: ProjectFormData) => {
    const newProject: Project = {
      id: Date.now(),
      ...projectData,
      spent: 0,
      team_size: Math.floor(Math.random() * 8) + 2,
      progress: 0,
    }
    setProjects(prev => [newProject, ...prev])
    setIsCreateDialogOpen(false)
    toast.success('Project created successfully!')
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
  }

  const handleUpdateProject = (projectData: ProjectFormData) => {
    if (editingProject) {
      setProjects(prev => prev.map(p =>
        p.id === editingProject.id ? { ...p, ...projectData } : p
      ))
      setEditingProject(null)
      toast.success('Project updated successfully!')
    }
  }

  const handleDeleteProject = (projectId: number) => {
    setProjects(prev => prev.filter(p => p.id !== projectId))
    toast.success('Project deleted successfully!')
  }

  const handleViewProject = (project: Project) => {
    setViewingProject(project)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Project Management</h2>
          <p className="text-muted-foreground">
            Manage your project portfolio with comprehensive tracking and analytics
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <ProjectForm onSubmit={handleCreateProject} mode="create" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Metrics */}
      <ProjectMetrics projects={projects} />

      {/* Projects Table */}
      <ProjectTable
        projects={projects}
        onEdit={handleEditProject}
        onDelete={handleDeleteProject}
        onView={handleViewProject}
      />

      {/* Edit Project Dialog */}
      <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <ProjectForm
              initialData={editingProject}
              onSubmit={handleUpdateProject}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Project Dialog */}
      <Dialog open={!!viewingProject} onOpenChange={(open) => !open && setViewingProject(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
          </DialogHeader>
          {viewingProject && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold">{viewingProject.name}</h3>
                <Badge className={statusColors[viewingProject.status]}>
                  {viewingProject.status}
                </Badge>
                <Badge variant="outline" className={priorityColors[viewingProject.priority]}>
                  {viewingProject.priority}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  {viewingProject.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Project Manager</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{viewingProject.manager}</span>
                  </div>
                </div>
                <div>
                  <Label>Team Size</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{viewingProject.team_size} members</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{new Date(viewingProject.start_date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <Label>End Date</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{new Date(viewingProject.end_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Budget</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">${viewingProject.budget.toLocaleString()}</span>
                  </div>
                </div>
                {viewingProject.spent !== undefined && (
                  <div>
                    <Label>Spent</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">${viewingProject.spent.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label>Progress</Label>
                <div className="space-y-2 mt-1">
                  <Progress value={viewingProject.progress} className="w-full" />
                  <span className="text-sm text-muted-foreground">{viewingProject.progress}% complete</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}