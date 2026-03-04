"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useProjectFilters } from '@/hooks/use-project-filters'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts'
import ProjectSpaceSelector from "@/components/project-space-selector"
import { EnhancedTicketTable } from "@/components/enhanced-ticket-table"
import { ProjectSpace, Ticket, TicketActivity } from "@/types"
import { getProjectSpaces, initializeDefaultSpace, migrateTicketsToDefaultSpace, getTicketsBySpace } from "@/lib/project-storage"
import { getDashboardMetrics, getWeeklyProgress, getMonthlyTrend, getRecentActivityFeed, DashboardMetrics } from "@/lib/data-aggregation"
import { formatDistanceToNow } from "date-fns"
import {
  Calendar,
  Clock,
  User,
  DollarSign,
  Target,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  Users,
  Bell,
  Plus,
  ArrowRight,
  BarChart3,
  Sparkles,
  Zap
} from "lucide-react"

function MetricsGrid() {
  const [realMetrics, setRealMetrics] = useState<DashboardMetrics | null>(null)

  useEffect(() => {
    setRealMetrics(getDashboardMetrics())
  }, [])

  const m = realMetrics || { totalTickets: 0, openTickets: 0, completedTickets: 0, activeProjects: 0, teamMembers: 0, completionRate: 0, avgResolutionTime: 0, overdueTickets: 0 }

  const metrics = [
    {
      title: "Total Tickets",
      value: m.totalTickets,
      icon: Target,
      color: "from-blue-600 to-blue-500",
      glow: "glow-cyan",
      subtitle: `${m.overdueTickets} overdue`,
      href: "/tickets"
    },
    {
      title: "Open Tickets",
      value: m.openTickets,
      icon: AlertCircle,
      color: "from-yellow-500 to-orange-500",
      glow: "glow-purple",
      subtitle: `${m.completedTickets} completed`,
      href: "/tickets?status=open"
    },
    {
      title: "Completion Rate",
      value: `${m.completionRate}%`,
      icon: CheckCircle,
      color: "from-emerald-500 to-green-500",
      glow: "glow-cyan",
      progress: m.completionRate,
      href: "/tickets?status=completed"
    },
    {
      title: "Active Projects",
      value: m.activeProjects,
      icon: BarChart3,
      color: "from-blue-600 to-blue-500",
      glow: "glow-purple",
      subtitle: `${m.teamMembers} team members`,
      href: "/projects"
    }
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon
        return (
          <Link key={index} href={metric.href}>
            <Card className="glass card-hover hover-lift group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground/90">{metric.title}</CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${metric.color} ${metric.glow} group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-1">{metric.value}</div>
                {metric.progress !== undefined && (
                  <Progress value={metric.progress} className="mt-2" />
                )}
                {metric.subtitle && (
                  <p className="text-xs text-muted-foreground/60">{metric.subtitle}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

function RecentActivityFeed() {
  const [activities, setActivities] = useState<TicketActivity[]>([])

  useEffect(() => {
    setActivities(getRecentActivityFeed(5))
  }, [])

  const activityColor = (type: string) => {
    if (type === 'status_change') return 'text-blue-400'
    if (type === 'comment_added') return 'text-emerald-400'
    if (type === 'priority_change') return 'text-orange-400'
    if (type === 'assignee_change') return 'text-purple-400'
    return 'text-blue-400'
  }

  return (
    <Card className="col-span-1 glass card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Activity className="h-5 w-5 text-blue-400" />
          Recent Activity
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Latest updates from your team and projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 group">
                <div className={`p-2 rounded-full bg-muted ${activityColor(activity.type)} group-hover:scale-110 transition-transform duration-300`}>
                  <Activity className="h-3 w-3" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground">
                    {activity.description}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground/60">
                    <User className="h-3 w-3 mr-1" />
                    {activity.user_name} &middot; {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No recent activity</p>
            <p className="text-xs mt-1">Activity will appear here as you work on tickets</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function WeeklyProgressChart() {
  const [data, setData] = useState<{ day: string; completed: number; created: number }[]>([])

  useEffect(() => {
    setData(getWeeklyProgress())
  }, [])

  return (
    <Card className="col-span-2 glass card-hover">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-400" />
          Weekly Progress
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Tickets created vs completed this week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            completed: {
              label: "Completed",
              color: "#10b981",
            },
            created: {
              label: "Created",
              color: "#3b82f6",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="day" />
              <YAxis />
              <Bar dataKey="completed" fill="#10b981" name="Completed" />
              <Bar dataKey="created" fill="#3b82f6" name="Created" />
              <ChartTooltip content={<ChartTooltipContent />} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function PerformanceTrendChart() {
  const [data, setData] = useState<{ month: string; created: number; completed: number }[]>([])

  useEffect(() => {
    setData(getMonthlyTrend(6))
  }, [])

  return (
    <Card className="col-span-1 glass card-hover">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-500" />
          Monthly Trend
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Tickets created over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            created: {
              label: "Created",
              color: "#1e40af",
            },
            completed: {
              label: "Completed",
              color: "#10b981",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <XAxis dataKey="month" />
              <YAxis />
              <Area
                type="monotone"
                dataKey="created"
                stroke="#1e40af"
                fill="#1e40af"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function QuickActions() {
  return (
    <Card className="glass card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Plus className="h-5 w-5 text-blue-400" />
          Quick Actions
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Common tasks and shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <Button className="justify-start bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white glow-gradient">
            <Plus className="h-4 w-4 mr-2" />
            Create New Ticket
          </Button>
          <Button variant="outline" className="justify-start glass border-border hover:bg-muted">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Meeting
          </Button>
          <Button variant="outline" className="justify-start glass border-border hover:bg-muted">
            <Users className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
          <Button variant="outline" className="justify-start glass border-border hover:bg-muted">
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function AlertsAndNotifications() {
  const alerts = [
    { id: 1, type: 'warning', message: '3 tickets are overdue', action: 'View Tickets' },
    { id: 2, type: 'info', message: 'Project Alpha milestone due tomorrow', action: 'View Project' },
    { id: 3, type: 'success', message: 'Weekly goals achieved!', action: 'View Report' }
  ]

  return (
    <Card className="glass card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Bell className="h-5 w-5 text-yellow-400" />
          Alerts & Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg glass border-border/50 hover:bg-muted/50 transition-colors">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  alert.type === 'warning' ? 'bg-yellow-500' :
                  alert.type === 'info' ? 'bg-blue-600' : 'bg-emerald-500'
                }`} />
                <span className="text-sm text-foreground/90">{alert.message}</span>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-600/10">
                {alert.action}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function RecentTicketsSection() {
  const router = useRouter()
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([])

  useEffect(() => {
    const all = getTicketsBySpace(null)
    const sorted = [...all].sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())
    setRecentTickets(sorted.slice(0, 10))
  }, [])

  return (
    <Card className="glass card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Target className="h-5 w-5 text-blue-400" />
              Recent Tickets
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Latest 10 tickets across all projects
            </CardDescription>
          </div>
          <Link href="/tickets">
            <Button variant="outline" size="sm" className="glass border-border hover:bg-muted">
              <ArrowRight className="h-4 w-4 mr-1" />
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <EnhancedTicketTable
          tickets={recentTickets}
          onView={(ticket) => router.push(`/tickets/${ticket.id}`)}
          onEdit={(ticket) => router.push(`/tickets/${ticket.id}`)}
          onDelete={() => {}}
        />
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [projectSpaces, setProjectSpaces] = useState<ProjectSpace[]>([])
  const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filter state management
  const {
    searchTerm,
    ticketCountFilter,
    sortOption,
    setSearchTerm,
    setTicketCountFilter,
    setSortOption,
    clearAllFilters
  } = useProjectFilters()

  useEffect(() => {
    // Initialize project spaces and tickets
    const loadData = () => {
      try {
        // Initialize default space if needed
        initializeDefaultSpace()

        // Migrate existing tickets to default space
        migrateTicketsToDefaultSpace()

        // Load project spaces
        const spaces = getProjectSpaces()
        setProjectSpaces(spaces)

        // Load tickets
        const allTickets = getTicketsBySpace(null) // Get all tickets initially
        setTickets(allTickets)

        setIsLoading(false)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSpaceSelect = (spaceId: number | null) => {
    setSelectedSpaceId(spaceId)
    const filteredTickets = getTicketsBySpace(spaceId)
    setTickets(filteredTickets)
  }

  return (
    <MainLayout>
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gradient text-glow">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Welcome back! Here's what's happening with your projects.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center gap-1 glass border-border">
              <Clock className="h-3 w-3" />
              Last updated: 2m ago
            </Badge>
          </div>
        </div>

        {/* Metrics Grid */}
        <MetricsGrid />

        {/* Project Space Selector */}
        {!isLoading && (
          <ProjectSpaceSelector
            spaces={projectSpaces}
            selectedSpaceId={selectedSpaceId}
            onSpaceSelect={handleSpaceSelect}
            filterState={{ searchTerm, ticketCountFilter, sortOption }}
            onFilterChange={({ searchTerm: newSearch, ticketCountFilter: newTickets, sortOption: newSort }) => {
              if (newSearch !== undefined) setSearchTerm(newSearch)
              if (newTickets !== undefined) setTicketCountFilter(newTickets)
              if (newSort !== undefined) setSortOption(newSort)
            }}
          />
        )}

        {/* Recent Tickets Table */}
        <RecentTicketsSection />

        {/* Charts and Activity Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          <WeeklyProgressChart />
          <RecentActivityFeed />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <PerformanceTrendChart />
          <QuickActions />
          <AlertsAndNotifications />
        </div>
      </div>
    </MainLayout>
  )
}