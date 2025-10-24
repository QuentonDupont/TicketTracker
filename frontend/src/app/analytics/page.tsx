"use client"

import { useState, useEffect, useMemo } from 'react'
import { MainLayout } from "@/components/layout/main-layout"
import { Ticket } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import {
  Calendar,
  Download,
  Filter,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Target,
  Users,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  FileText,
  Settings
} from "lucide-react"

// Mock data for analytics
const performanceData = [
  { month: 'Jan', completed: 45, created: 52, efficiency: 87 },
  { month: 'Feb', completed: 52, created: 49, efficiency: 106 },
  { month: 'Mar', completed: 38, created: 61, efficiency: 62 },
  { month: 'Apr', completed: 64, created: 58, efficiency: 110 },
  { month: 'May', completed: 71, created: 65, efficiency: 109 },
  { month: 'Jun', completed: 58, created: 54, efficiency: 107 }
]

const statusDistribution = [
  { name: 'Completed', value: 42, color: '#10b981' },
  { name: 'In Progress', value: 28, color: '#3b82f6' },
  { name: 'Open', value: 18, color: '#f59e0b' },
  { name: 'Blocked', value: 8, color: '#ef4444' },
  { name: 'On Hold', value: 4, color: '#6b7280' }
]

const priorityData = [
  { priority: 'Critical', count: 5, color: '#ef4444' },
  { priority: 'High', count: 12, color: '#f59e0b' },
  { priority: 'Medium', count: 35, color: '#3b82f6' },
  { priority: 'Low', count: 48, color: '#10b981' }
]

const teamPerformance = [
  { name: 'Alice Johnson', completed: 15, inProgress: 3, efficiency: 95 },
  { name: 'Bob Wilson', completed: 12, inProgress: 5, efficiency: 88 },
  { name: 'Charlie Brown', completed: 18, inProgress: 2, efficiency: 92 },
  { name: 'Diana Prince', completed: 9, inProgress: 4, efficiency: 85 },
  { name: 'Eve Adams', completed: 14, inProgress: 3, efficiency: 90 }
]

const projectMetrics = [
  { project: 'Alpha', budget: 50000, spent: 42000, completion: 85, tickets: 24 },
  { project: 'Beta', budget: 75000, spent: 35000, completion: 65, tickets: 18 },
  { project: 'Gamma', budget: 30000, spent: 28000, completion: 95, tickets: 12 },
  { project: 'Delta', budget: 60000, spent: 15000, completion: 25, tickets: 32 }
]

const velocityData = [
  { sprint: 'Sprint 1', planned: 40, completed: 38, velocity: 38 },
  { sprint: 'Sprint 2', planned: 42, completed: 45, velocity: 45 },
  { sprint: 'Sprint 3', planned: 38, completed: 35, velocity: 35 },
  { sprint: 'Sprint 4', planned: 45, completed: 48, velocity: 48 },
  { sprint: 'Sprint 5', planned: 40, completed: 42, velocity: 42 }
]

const burndownData = [
  { day: 'Day 1', remaining: 100, ideal: 100 },
  { day: 'Day 2', remaining: 95, ideal: 90 },
  { day: 'Day 3', remaining: 88, ideal: 80 },
  { day: 'Day 4', remaining: 82, ideal: 70 },
  { day: 'Day 5', remaining: 75, ideal: 60 },
  { day: 'Day 6', remaining: 68, ideal: 50 },
  { day: 'Day 7', remaining: 58, ideal: 40 },
  { day: 'Day 8', remaining: 45, ideal: 30 },
  { day: 'Day 9', remaining: 32, ideal: 20 },
  { day: 'Day 10', remaining: 18, ideal: 10 },
  { day: 'Day 11', remaining: 5, ideal: 0 }
]

function ReportHeader() {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
        <p className="text-muted-foreground">
          Comprehensive insights into your project performance and team productivity.
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Configure
        </Button>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>
    </div>
  )
}

function KPIOverview() {
  const kpis = [
    {
      title: "Average Velocity",
      value: "42.6",
      unit: "story points",
      change: "+5.2%",
      trend: "up",
      icon: TrendingUp
    },
    {
      title: "Team Utilization",
      value: "87%",
      unit: "capacity",
      change: "+2.1%",
      trend: "up",
      icon: Users
    },
    {
      title: "Cycle Time",
      value: "4.2",
      unit: "days",
      change: "-0.8%",
      trend: "down",
      icon: Clock
    },
    {
      title: "Budget Efficiency",
      value: "91%",
      unit: "utilization",
      change: "+3.5%",
      trend: "up",
      icon: DollarSign
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => {
        const IconComponent = kpi.icon
        const isPositive = kpi.trend === "up"
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <IconComponent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpi.value} <span className="text-sm font-normal text-muted-foreground">{kpi.unit}</span>
              </div>
              <p className={`text-xs flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1 rotate-180" />}
                {kpi.change} from last period
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function CustomReportBuilder() {
  const [reportType, setReportType] = useState("performance")
  const [dateRange, setDateRange] = useState("last30days")
  const [chartType, setChartType] = useState("bar")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Custom Report Builder
        </CardTitle>
        <CardDescription>
          Build custom reports with your preferred metrics and visualizations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <Label htmlFor="report-type">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="performance">Team Performance</SelectItem>
                <SelectItem value="project">Project Status</SelectItem>
                <SelectItem value="velocity">Sprint Velocity</SelectItem>
                <SelectItem value="burndown">Burndown Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date-range">Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="last3months">Last 3 Months</SelectItem>
                <SelectItem value="lastyear">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="chart-type">Chart Type</Label>
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="area">Area Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MonthlyTicketDistribution() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date().toLocaleString('default', { month: 'long' }))

  // Load tickets from localStorage
  useEffect(() => {
    const storedTickets = localStorage.getItem('tickets')
    if (storedTickets) {
      setTickets(JSON.parse(storedTickets))
    }
  }, [])

  // Process data for current month
  const { dailyData, priorityData } = useMemo(() => {
    const now = new Date()
    const currentMonthNum = now.getMonth()
    const currentYear = now.getFullYear()

    // Filter tickets created in current month (all statuses)
    const monthlyTickets = tickets.filter(ticket => {
      const ticketDate = new Date(ticket.created_date)
      return ticketDate.getMonth() === currentMonthNum &&
             ticketDate.getFullYear() === currentYear
    })

    // Get number of days in current month
    const daysInMonth = new Date(currentYear, currentMonthNum + 1, 0).getDate()

    // Initialize daily data structure
    const dailyMap: { [day: number]: { day: string; Low: number; Medium: number; High: number } } = {}
    for (let i = 1; i <= daysInMonth; i++) {
      dailyMap[i] = { day: i.toString(), Low: 0, Medium: 0, High: 0 }
    }

    // Initialize priority totals
    const priorityTotals = { Low: 0, Medium: 0, High: 0 }

    // Count tickets by day and priority
    monthlyTickets.forEach(ticket => {
      const ticketDate = new Date(ticket.created_date)
      const day = ticketDate.getDate()

      if (dailyMap[day]) {
        dailyMap[day][ticket.priority]++
      }
      priorityTotals[ticket.priority]++
    })

    // Convert to array for bar chart
    const dailyData = Object.values(dailyMap)

    // Convert priority totals to array for pie chart
    const priorityData = [
      { name: 'Low', value: priorityTotals.Low, color: '#10b981' },
      { name: 'Medium', value: priorityTotals.Medium, color: '#f59e0b' },
      { name: 'High', value: priorityTotals.High, color: '#ef4444' }
    ].filter(item => item.value > 0) // Only show priorities that have tickets

    return { dailyData, priorityData }
  }, [tickets])

  const totalTickets = priorityData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Ticket Distribution</CardTitle>
        <CardDescription>
          All tickets created in {currentMonth} by day and priority
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Bar Chart - Daily Distribution */}
          <div>
            <h3 className="text-sm font-medium mb-4">Daily Distribution</h3>
            <ChartContainer
              config={{
                Low: { label: "Low Priority", color: "#10b981" },
                Medium: { label: "Medium Priority", color: "#f59e0b" },
                High: { label: "High Priority", color: "#ef4444" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <XAxis
                    dataKey="day"
                    label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis label={{ value: 'Tickets', angle: -90, position: 'insideLeft' }} />
                  <Bar dataKey="Low" stackId="a" fill="#10b981" />
                  <Bar dataKey="Medium" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="High" stackId="a" fill="#ef4444" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Pie Chart - Priority Breakdown */}
          <div>
            <h3 className="text-sm font-medium mb-4">Priority Breakdown</h3>
            <ChartContainer
              config={{
                value: { label: "Tickets", color: "#3b82f6" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            {totalTickets > 0 && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Total: {totalTickets} ticket{totalTickets !== 1 ? 's' : ''} created this month
              </div>
            )}
            {totalTickets === 0 && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                No tickets created this month
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PerformanceAnalytics() {
  return (
    <div className="space-y-4">
      <MonthlyTicketDistribution />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance Trend</CardTitle>
            <CardDescription>Tickets completed vs created over time</CardDescription>
          </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              completed: { label: "Completed", color: "#10b981" },
              created: { label: "Created", color: "#3b82f6" },
              efficiency: { label: "Efficiency %", color: "#8b5cf6" }
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ticket Status Distribution</CardTitle>
          <CardDescription>Current distribution of ticket statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: { label: "Tickets", color: "#3b82f6" }
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

function TeamAnalytics() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
          <CardDescription>Individual team member productivity metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              completed: { label: "Completed", color: "#10b981" },
              inProgress: { label: "In Progress", color: "#f59e0b" }
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamPerformance} layout="horizontal">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Bar dataKey="completed" fill="#10b981" />
                <Bar dataKey="inProgress" fill="#f59e0b" />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Priority Distribution</CardTitle>
          <CardDescription>Tickets by priority level</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: { label: "Count", color: "#3b82f6" }
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <XAxis dataKey="priority" />
                <YAxis />
                <Bar dataKey="count" fill="#3b82f6" />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function ProjectAnalytics() {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Project Metrics Overview</CardTitle>
          <CardDescription>Budget utilization and completion status by project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectMetrics.map((project, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="font-medium">Project {project.project}</div>
                  <div className="flex items-center gap-4">
                    <Badge variant={project.completion > 80 ? "default" : project.completion > 50 ? "secondary" : "destructive"}>
                      {project.completion}% Complete
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Completion</span>
                    <span>{project.completion}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2"
                      style={{ width: `${project.completion}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Budget Used</span>
                    <span>{((project.spent / project.budget) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-500 rounded-full h-2"
                      style={{ width: `${(project.spent / project.budget) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sprint Velocity</CardTitle>
            <CardDescription>Planned vs completed story points</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                planned: { label: "Planned", color: "#6b7280" },
                completed: { label: "Completed", color: "#10b981" }
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={velocityData}>
                  <XAxis dataKey="sprint" />
                  <YAxis />
                  <Bar dataKey="planned" fill="#6b7280" />
                  <Bar dataKey="completed" fill="#10b981" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sprint Burndown</CardTitle>
            <CardDescription>Remaining work vs ideal burndown</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                remaining: { label: "Remaining", color: "#3b82f6" },
                ideal: { label: "Ideal", color: "#6b7280" }
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={burndownData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Line type="monotone" dataKey="remaining" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="ideal" stroke="#6b7280" strokeWidth={2} strokeDasharray="5 5" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <ReportHeader />

        <KPIOverview />

        <CustomReportBuilder />

        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Projects
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            <PerformanceAnalytics />
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <TeamAnalytics />
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <ProjectAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}