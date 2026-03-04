"use client"

import { useState, useEffect, useMemo } from 'react'
import { MainLayout } from "@/components/layout/main-layout"
import { Ticket, TeamMember } from "@/types"
import { getDashboardMetrics, getStatusDistribution, getPriorityDistribution, getTeamPerformance, getProjectMetrics, getMonthlyTrend } from "@/lib/data-aggregation"
import { getTeamMembers } from "@/lib/team-storage"
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

// Real data is loaded from localStorage via data-aggregation functions

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
  const [metrics, setMetrics] = useState({ totalTickets: 0, openTickets: 0, completedTickets: 0, completionRate: 0, teamMembers: 0, avgResolutionTime: 0, overdueTickets: 0, activeProjects: 0 })

  useEffect(() => {
    setMetrics(getDashboardMetrics())
  }, [])

  const kpis = [
    {
      title: "Total Tickets",
      value: String(metrics.totalTickets),
      unit: "tickets",
      icon: Target
    },
    {
      title: "Completion Rate",
      value: `${metrics.completionRate}%`,
      unit: "",
      icon: CheckCircle
    },
    {
      title: "Avg Resolution",
      value: String(metrics.avgResolutionTime),
      unit: "hours",
      icon: Clock
    },
    {
      title: "Overdue",
      value: String(metrics.overdueTickets),
      unit: "tickets",
      icon: AlertCircle
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => {
        const IconComponent = kpi.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <IconComponent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpi.value} {kpi.unit && <span className="text-sm font-normal text-muted-foreground">{kpi.unit}</span>}
              </div>
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
  const [monthlyData, setMonthlyData] = useState<{ month: string; created: number; completed: number }[]>([])
  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([])

  useEffect(() => {
    setMonthlyData(getMonthlyTrend(6))
    setStatusData(getStatusDistribution())
  }, [])

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
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
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
          {statusData.length > 0 ? (
            <ChartContainer
              config={{
                value: { label: "Tickets", color: "#3b82f6" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
              No ticket data available yet
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

function TeamAnalytics() {
  const [teamData, setTeamData] = useState<{ name: string; completedTickets: number; performanceScore: number }[]>([])
  const [priorityDist, setPriorityDist] = useState<{ name: string; value: number; color: string }[]>([])

  useEffect(() => {
    setTeamData(getTeamPerformance())
    setPriorityDist(getPriorityDistribution())
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
          <CardDescription>Individual team member productivity metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {teamData.length > 0 ? (
            <ChartContainer
              config={{
                completedTickets: { label: "Completed Tickets", color: "#10b981" },
                performanceScore: { label: "Performance Score", color: "#f59e0b" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamData} layout="horizontal">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Bar dataKey="completedTickets" fill="#10b981" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
              No team data available yet
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Priority Distribution</CardTitle>
          <CardDescription>Tickets by priority level</CardDescription>
        </CardHeader>
        <CardContent>
          {priorityDist.length > 0 ? (
            <ChartContainer
              config={{
                value: { label: "Count", color: "#3b82f6" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityDist}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="value">
                    {priorityDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
              No ticket data available yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ProjectAnalytics() {
  const [projects, setProjects] = useState<{ name: string; total: number; completed: number; color: string }[]>([])

  useEffect(() => {
    setProjects(getProjectMetrics())
  }, [])

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Project Metrics Overview</CardTitle>
          <CardDescription>Ticket completion status by project</CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length > 0 ? (
            <div className="space-y-4">
              {projects.map((project, index) => {
                const completionPct = project.total > 0 ? Math.round((project.completed / project.total) * 100) : 0
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: project.color }} />
                        <span className="font-medium">{project.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={completionPct > 80 ? "default" : completionPct > 50 ? "secondary" : "destructive"}>
                          {completionPct}% Complete
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {project.completed} / {project.total} tickets
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Completion</span>
                        <span>{completionPct}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2"
                          style={{ width: `${completionPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No projects available yet. Create a project to see metrics here.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Project</CardTitle>
            <CardDescription>Ticket count per project space</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length > 0 ? (
              <ChartContainer
                config={{
                  total: { label: "Total", color: "#3b82f6" },
                  completed: { label: "Completed", color: "#10b981" }
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projects}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Bar dataKey="total" fill="#3b82f6" />
                    <Bar dataKey="completed" fill="#10b981" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                Insufficient data
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sprint Velocity</CardTitle>
            <CardDescription>Sprint-level data requires sprint tracking configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
              <div className="text-center">
                <p>Insufficient data for velocity tracking</p>
                <p className="text-xs mt-1">Sprint tracking will be available as more data accumulates</p>
              </div>
            </div>
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