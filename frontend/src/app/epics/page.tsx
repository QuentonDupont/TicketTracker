"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  Search,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Calendar,
  User,
  Target,
  Clock,
  CheckCircle,
  Circle,
  Pause,
  Play,
} from "lucide-react"
import { toast } from "sonner"
import { Epic, EpicStatus } from "@/types"
import { EpicForm } from "@/components/epic-form"

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

// Initial sample epics
const initialEpics: Epic[] = [
  {
    id: 1,
    title: "Q1 Platform Modernization",
    description: "Upgrade core platform infrastructure and migrate to cloud-native architecture",
    status: "In Progress",
    color: "#3b82f6",
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    owner: "Alice Johnson",
    created_date: new Date().toISOString()
  },
  {
    id: 2,
    title: "Mobile App Launch",
    description: "Design and develop native mobile applications for iOS and Android",
    status: "Planning",
    color: "#1e40af",
    start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    owner: "Bob Wilson",
    created_date: new Date().toISOString()
  },
  {
    id: 3,
    title: "Customer Portal Redesign",
    description: "Complete UI/UX overhaul of customer-facing portal with modern design",
    status: "In Progress",
    color: "#10b981",
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    owner: "Charlie Brown",
    created_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export default function EpicsPage() {
  const router = useRouter()
  const [epics, setEpics] = useState<Epic[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showNewEpicDialog, setShowNewEpicDialog] = useState(false)

  useEffect(() => {
    // Load epics from localStorage
    const loadEpics = () => {
      try {
        const storedEpics = localStorage.getItem('epics')
        if (storedEpics) {
          setEpics(JSON.parse(storedEpics))
        } else {
          // Initialize with sample data
          localStorage.setItem('epics', JSON.stringify(initialEpics))
          setEpics(initialEpics)
        }
      } catch (error) {
        toast.error('Error loading epics')
        setEpics(initialEpics)
      } finally {
        setIsLoading(false)
      }
    }

    loadEpics()
  }, [])

  const handleCreateEpic = (formData: any) => {
    try {
      const newEpic: Epic = {
        id: epics.length > 0 ? Math.max(...epics.map(e => e.id)) + 1 : 1,
        ...formData,
        created_date: new Date().toISOString()
      }
      const updatedEpics = [...epics, newEpic]
      localStorage.setItem('epics', JSON.stringify(updatedEpics))
      setEpics(updatedEpics)
      setShowNewEpicDialog(false)
    } catch (error) {
      toast.error('Error creating epic')
    }
  }

  const handleDelete = (epicId: number) => {
    if (confirm('Are you sure you want to delete this epic? All associated tickets will be unlinked.')) {
      try {
        const updatedEpics = epics.filter(e => e.id !== epicId)
        localStorage.setItem('epics', JSON.stringify(updatedEpics))
        setEpics(updatedEpics)
        toast.success('Epic deleted successfully')
      } catch (error) {
        toast.error('Error deleting epic')
      }
    }
  }

  const handleView = (epicId: number) => {
    router.push(`/epics/${epicId}`)
  }

  const calculateProgress = (epic: Epic) => {
    // This would calculate based on linked tickets in a real implementation
    // For now, return mock progress based on status
    if (epic.status === 'Completed') return 100
    if (epic.status === 'In Progress') return 65
    if (epic.status === 'Planning') return 15
    return 0
  }

  const getTicketCount = (epicId: number) => {
    // This would count linked tickets in a real implementation
    // For now, return mock counts
    return Math.floor(Math.random() * 20) + 5
  }

  const filteredEpics = epics.filter(epic =>
    epic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    epic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    epic.owner?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading epics...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Epic Management</h1>
            <p className="text-muted-foreground mt-2">
              Organize and track large initiatives across your projects
            </p>
          </div>
          <Button
            onClick={() => setShowNewEpicDialog(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Epic
          </Button>
        </div>

        {/* Search and Stats */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search epics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-4">
            <Badge variant="outline" className="text-sm">
              <Target className="h-3 w-3 mr-1" />
              {epics.length} Total Epics
            </Badge>
            <Badge variant="outline" className="text-sm">
              <Play className="h-3 w-3 mr-1" />
              {epics.filter(e => e.status === 'In Progress').length} In Progress
            </Badge>
          </div>
        </div>

        {/* Epics Grid */}
        {filteredEpics.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No epics found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Get started by creating your first epic"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowNewEpicDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Epic
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEpics.map((epic) => {
              const StatusIcon = statusIcons[epic.status]
              const progress = calculateProgress(epic)
              const ticketCount = getTicketCount(epic.id)

              return (
                <Card
                  key={epic.id}
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden"
                  onClick={() => handleView(epic.id)}
                >
                  {/* Color stripe */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: epic.color }}
                  />

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link
                          href={`/epics/${epic.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-blue-400 transition-colors"
                        >
                          <CardTitle className="text-lg group-hover:text-blue-400 transition-colors">
                            {epic.title}
                          </CardTitle>
                        </Link>
                        <CardDescription className="mt-2 line-clamp-2">
                          {epic.description}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleView(epic.id); }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.info('Edit functionality coming soon'); }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Epic
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); handleDelete(epic.id); }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Epic
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[epic.status]}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {epic.status}
                      </Badge>
                      <Badge variant="secondary">
                        {ticketCount} tickets
                      </Badge>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Owner */}
                    {epic.owner && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="h-4 w-4 mr-2" />
                        {epic.owner}
                      </div>
                    )}

                    {/* Dates */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(epic.start_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(epic.end_date).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* New Epic Dialog */}
        <Dialog open={showNewEpicDialog} onOpenChange={setShowNewEpicDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <EpicForm onSubmit={handleCreateEpic} mode="create" />
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
