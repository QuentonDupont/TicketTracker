"use client"

import { useState, useEffect } from 'react'
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts'
import {
  Plus,
  Calendar,
  DollarSign,
  Users,
  Target,
  AlertTriangle,
  Clock,
  CheckCircle,
  CircleX,
  MoreHorizontal,
  Edit,
  Trash2,
  Settings,
  Filter,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock as Timeline,
  Target as Milestone,
  FileText,
  Award
} from "lucide-react"

// Mock data for projects
const projects = [
  {
    id: 1,
    name: "Project Alpha",
    description: "Mobile app development for e-commerce platform",
    status: "active",
    priority: "high",
    manager: "Alice Johnson",
    startDate: "2025-01-15",
    endDate: "2025-06-30",
    budget: 150000,
    spent: 87000,
    completion: 65,
    teamSize: 8,
    riskLevel: "medium",
    milestones: 5,
    completedMilestones: 3,
    tickets: 42
  },
  {
    id: 2,
    name: "Project Beta",
    description: "Data analytics dashboard implementation",
    status: "active",
    priority: "medium",
    manager: "Bob Wilson",
    startDate: "2025-02-01",
    endDate: "2025-05-15",
    budget: 95000,
    spent: 34000,
    completion: 40,
    teamSize: 5,
    riskLevel: "low",
    milestones: 4,
    completedMilestones: 1,
    tickets: 28
  },
  {
    id: 3,
    name: "Project Gamma",
    description: "Infrastructure modernization",
    status: "completed",
    priority: "high",
    manager: "Charlie Brown",
    startDate: "2024-10-01",
    endDate: "2025-01-31",
    budget: 200000,
    spent: 185000,
    completion: 100,
    teamSize: 12,
    riskLevel: "low",
    milestones: 6,
    completedMilestones: 6,
    tickets: 67
  },
  {
    id: 4,
    name: "Project Delta",
    description: "Customer portal redesign",
    status: "planning",
    priority: "low",
    manager: "Diana Prince",
    startDate: "2025-04-01",
    endDate: "2025-08-30",
    budget: 75000,
    spent: 5000,
    completion: 10,
    teamSize: 4,
    riskLevel: "medium",
    milestones: 3,
    completedMilestones: 0,
    tickets: 12
  }
]

const ganttData = [
  {
    task: "Project Planning",
    start: "2025-01-15",
    end: "2025-02-01",
    progress: 100,
    assignee: "Alice Johnson",
    dependencies: []
  },
  {
    task: "UI/UX Design",
    start: "2025-02-01",
    end: "2025-03-01",
    progress: 85,
    assignee: "Design Team",
    dependencies: ["Project Planning"]
  },
  {
    task: "Backend Development",
    start: "2025-02-15",
    end: "2025-05-15",
    progress: 60,
    assignee: "Dev Team A",
    dependencies: ["UI/UX Design"]
  },
  {
    task: "Frontend Development",
    start: "2025-03-01",
    end: "2025-05-30",
    progress: 45,
    assignee: "Dev Team B",
    dependencies: ["UI/UX Design"]
  },
  {
    task: "Testing & QA",
    start: "2025-05-01",
    end: "2025-06-15",
    progress: 20,
    assignee: "QA Team",
    dependencies: ["Backend Development", "Frontend Development"]
  },
  {
    task: "Deployment",
    start: "2025-06-15",
    end: "2025-06-30",
    progress: 0,
    assignee: "DevOps Team",
    dependencies: ["Testing & QA"]
  }
]

const resourceAllocation = [
  { resource: "Frontend Developers", allocated: 3, available: 2, utilization: 150 },
  { resource: "Backend Developers", allocated: 4, available: 3, utilization: 133 },
  { resource: "UI/UX Designers", allocated: 2, available: 1, utilization: 200 },
  { resource: "QA Engineers", allocated: 2, available: 4, utilization: 50 },
  { resource: "DevOps Engineers", allocated: 1, available: 2, utilization: 50 },
  { resource: "Project Managers", allocated: 1, available: 1, utilization: 100 }
]

const budgetBreakdown = [
  { category: "Development", budget: 60000, spent: 42000, remaining: 18000 },
  { category: "Design", budget: 25000, spent: 18000, remaining: 7000 },
  { category: "Testing", budget: 15000, spent: 8000, remaining: 7000 },
  { category: "Infrastructure", budget: 30000, spent: 12000, remaining: 18000 },
  { category: "Tools & Licenses", budget: 20000, spent: 7000, remaining: 13000 }
]

const milestoneData = [
  {
    name: "Project Kickoff",
    date: "2025-01-15",
    status: "completed",
    progress: 100,
    description: "Project initiation and team setup"
  },
  {
    name: "Design Phase Complete",
    date: "2025-03-01",
    status: "completed",
    progress: 100,
    description: "UI/UX design approval and handoff"
  },
  {
    name: "MVP Development",
    date: "2025-04-15",
    status: "in-progress",
    progress: 70,
    description: "Core features development"
  },
  {
    name: "Beta Release",
    date: "2025-05-30",
    status: "upcoming",
    progress: 0,
    description: "Internal testing and feedback"
  },
  {
    name: "Production Release",
    date: "2025-06-30",
    status: "upcoming",
    progress: 0,
    description: "Final release to production"
  }
]

function ProjectsHeader() {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">
          Manage your projects with Gantt charts, resource tracking, and timeline visualization.
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Start a new project with templates or from scratch
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="project-name">Project Name</Label>
                <Input id="project-name" placeholder="Enter project name" />
              </div>
              <div>
                <Label htmlFor="project-template">Template</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web-app">Web Application</SelectItem>
                    <SelectItem value="mobile-app">Mobile Application</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="data-analytics">Data Analytics</SelectItem>
                    <SelectItem value="custom">Custom Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button>Create Project</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function ProjectsOverview() {
  const activeProjects = projects.filter(p => p.status === 'active').length
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0)
  const avgCompletion = Math.round(projects.reduce((sum, p) => sum + p.completion, 0) / projects.length)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeProjects}</div>
          <p className="text-xs text-muted-foreground">
            {projects.length} total projects
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round((totalSpent / totalBudget) * 100)}%
          </div>
          <Progress value={(totalSpent / totalBudget) * 100} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgCompletion}%</div>
          <p className="text-xs text-muted-foreground flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            +5% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {projects.reduce((sum, p) => sum + p.teamSize, 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            Across all projects
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function ProjectsList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Projects</CardTitle>
        <CardDescription>Overview of project status, budget, and progress</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-48">
                      {project.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {project.manager.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{project.manager}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      project.status === 'active' ? 'default' :
                      project.status === 'completed' ? 'secondary' :
                      project.status === 'planning' ? 'outline' : 'destructive'
                    }
                  >
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{project.completion}%</span>
                    </div>
                    <Progress value={project.completion} className="h-2" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">
                      ${(project.spent / 1000).toFixed(0)}k / ${(project.budget / 1000).toFixed(0)}k
                    </div>
                    <div className="text-muted-foreground">
                      {((project.spent / project.budget) * 100).toFixed(0)}% used
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{project.teamSize}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {new Date(project.endDate).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
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

function GanttChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timeline className="h-5 w-5" />
          Project Timeline (Gantt Chart)
        </CardTitle>
        <CardDescription>Visual timeline of project tasks and dependencies</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Select defaultValue="alpha">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alpha">Project Alpha</SelectItem>
                <SelectItem value="beta">Project Beta</SelectItem>
                <SelectItem value="gamma">Project Gamma</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>In Progress</span>
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Completed</span>
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              <span>Not Started</span>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="grid grid-cols-12 gap-1 text-xs text-muted-foreground mb-4">
              <div className="col-span-3">Task</div>
              <div className="col-span-2">Assignee</div>
              <div className="col-span-7 text-center">Timeline (Jan - Jul 2025)</div>
            </div>

            {ganttData.map((task, index) => (
              <div key={index} className="grid grid-cols-12 gap-1 py-2 border-b last:border-b-0">
                <div className="col-span-3">
                  <div className="font-medium text-sm">{task.task}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-muted-foreground">{task.assignee}</div>
                </div>
                <div className="col-span-7">
                  <div className="relative h-6 bg-gray-100 rounded">
                    <div
                      className={`absolute left-0 top-0 h-full rounded ${
                        task.progress === 100 ? 'bg-green-500' :
                        task.progress > 0 ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                      style={{ width: '60%' }}
                    >
                      <div
                        className="h-full bg-green-500 rounded-l"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <div className="absolute right-1 top-0 text-xs text-white font-medium leading-6">
                      {task.progress}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ResourceTracking() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Resource Allocation
        </CardTitle>
        <CardDescription>Team resource utilization across projects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {resourceAllocation.map((resource, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="font-medium">{resource.resource}</div>
                <div className="flex items-center space-x-4">
                  <Badge
                    variant={resource.utilization > 100 ? "destructive" :
                            resource.utilization > 80 ? "secondary" : "outline"}
                  >
                    {resource.utilization}% utilized
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {resource.allocated} / {resource.available + resource.allocated} available
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <Progress
                  value={Math.min(resource.utilization, 100)}
                  className="h-2"
                />
                {resource.utilization > 100 && (
                  <div className="flex items-center text-xs text-red-600">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Over-allocated by {resource.utilization - 100}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <ChartContainer
            config={{
              allocated: { label: "Allocated", color: "#3b82f6" },
              available: { label: "Available", color: "#10b981" }
            }}
            className="h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceAllocation} layout="horizontal">
                <XAxis type="number" />
                <YAxis dataKey="resource" type="category" width={120} />
                <Bar dataKey="allocated" fill="#3b82f6" />
                <Bar dataKey="available" fill="#10b981" />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function BudgetTracking() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Budget Breakdown
        </CardTitle>
        <CardDescription>Financial tracking and budget utilization</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {budgetBreakdown.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="font-medium">{item.category}</div>
                <div className="text-sm text-muted-foreground">
                  ${item.spent.toLocaleString()} / ${item.budget.toLocaleString()}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{((item.spent / item.budget) * 100).toFixed(1)}% used</span>
                  <span>${item.remaining.toLocaleString()} remaining</span>
                </div>
                <Progress value={(item.spent / item.budget) * 100} className="h-2" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <ChartContainer
            config={{
              spent: { label: "Spent", color: "#ef4444" },
              remaining: { label: "Remaining", color: "#10b981" }
            }}
            className="h-[250px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetBreakdown.map(item => ({
                    name: item.category,
                    spent: item.spent,
                    remaining: item.remaining
                  }))}
                  dataKey="spent"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {budgetBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function MilestonesTracking() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Milestone className="h-5 w-5" />
          Project Milestones
        </CardTitle>
        <CardDescription>Key project milestones and deliverables</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {milestoneData.map((milestone, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 rounded-lg border">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                milestone.status === 'completed' ? 'bg-green-100 text-green-600' :
                milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                'bg-gray-100 text-gray-400'
              }`}>
                {milestone.status === 'completed' ? <CheckCircle className="h-5 w-5" /> :
                 milestone.status === 'in-progress' ? <Clock className="h-5 w-5" /> :
                 <Target className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{milestone.name}</h4>
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Due: {new Date(milestone.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      milestone.status === 'completed' ? 'secondary' :
                      milestone.status === 'in-progress' ? 'default' : 'outline'
                    }
                  >
                    {milestone.status}
                  </Badge>
                </div>
                {milestone.status === 'in-progress' && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{milestone.progress}%</span>
                    </div>
                    <Progress value={milestone.progress} className="h-2" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProjectsPage() {
  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <ProjectsHeader />

        <ProjectsOverview />

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <ProjectsList />
          </TabsContent>

          <TabsContent value="gantt" className="space-y-4">
            <GanttChart />
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <ResourceTracking />
          </TabsContent>

          <TabsContent value="budget" className="space-y-4">
            <BudgetTracking />
          </TabsContent>

          <TabsContent value="milestones" className="space-y-4">
            <MilestonesTracking />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}