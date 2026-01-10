"use client"

import { useState, useEffect } from 'react'
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts'
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"
import { Grid } from "@/components/ui/grid"
import { Spotlight } from "@/components/ui/spotlight"
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

// Mock data for dashboard
const mockMetrics = {
  totalTickets: 42,
  openTickets: 18,
  completedTickets: 24,
  activeProjects: 6,
  teamMembers: 12,
  completionRate: 85,
  averageResolutionTime: 4.2,
  overdueTickets: 3
}

const recentActivity = [
  {
    id: 1,
    type: 'ticket_created',
    message: 'New ticket created: "Fix login bug"',
    user: 'Alice Johnson',
    timestamp: '2 minutes ago',
    icon: Plus,
    color: 'text-cyan-400'
  },
  {
    id: 2,
    type: 'ticket_completed',
    message: 'Ticket completed: "Update user profile UI"',
    user: 'Bob Wilson',
    timestamp: '15 minutes ago',
    icon: CheckCircle,
    color: 'text-emerald-400'
  },
  {
    id: 3,
    type: 'project_milestone',
    message: 'Project milestone reached: "Beta Release"',
    user: 'Charlie Brown',
    timestamp: '1 hour ago',
    icon: Target,
    color: 'text-purple-400'
  },
  {
    id: 4,
    type: 'team_update',
    message: 'New team member joined: Diana Prince',
    user: 'System',
    timestamp: '3 hours ago',
    icon: Users,
    color: 'text-orange-400'
  },
  {
    id: 5,
    type: 'ticket_overdue',
    message: 'Ticket overdue: "Database optimization"',
    user: 'System',
    timestamp: '5 hours ago',
    icon: AlertCircle,
    color: 'text-red-400'
  }
]

const weeklyProgress = [
  { day: 'Mon', completed: 12, created: 15 },
  { day: 'Tue', completed: 19, created: 12 },
  { day: 'Wed', completed: 8, created: 18 },
  { day: 'Thu', completed: 22, created: 9 },
  { day: 'Fri', completed: 15, created: 14 },
  { day: 'Sat', completed: 5, created: 3 },
  { day: 'Sun', completed: 3, created: 2 }
]

const performanceTrend = [
  { month: 'Jan', efficiency: 78 },
  { month: 'Feb', efficiency: 82 },
  { month: 'Mar', efficiency: 79 },
  { month: 'Apr', efficiency: 86 },
  { month: 'May', efficiency: 91 },
  { month: 'Jun', efficiency: 85 }
]

function MetricsGrid() {
  const metrics = [
    {
      title: "Total Tickets",
      value: mockMetrics.totalTickets,
      icon: Target,
      color: "from-cyan-500 to-blue-500",
      glow: "glow-cyan",
      trend: "+12%",
      trendIcon: TrendingUp
    },
    {
      title: "Open Tickets",
      value: mockMetrics.openTickets,
      icon: AlertCircle,
      color: "from-yellow-500 to-orange-500",
      glow: "glow-purple",
      trend: "-5%",
      trendIcon: TrendingDown
    },
    {
      title: "Completion Rate",
      value: `${mockMetrics.completionRate}%`,
      icon: CheckCircle,
      color: "from-emerald-500 to-green-500",
      glow: "glow-cyan",
      progress: mockMetrics.completionRate
    },
    {
      title: "Active Projects",
      value: mockMetrics.activeProjects,
      icon: BarChart3,
      color: "from-purple-500 to-pink-500",
      glow: "glow-purple",
      trend: "+2",
      trendIcon: TrendingUp
    }
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon
        const TrendIcon = metric.trendIcon
        return (
          <Card key={index} className="glass card-hover hover-lift group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground/90">{metric.title}</CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${metric.color} ${metric.glow} group-hover:scale-110 transition-transform duration-300`}>
                <IconComponent className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">{metric.value}</div>
              {metric.trend && TrendIcon && (
                <p className="text-xs text-muted-foreground/60 flex items-center">
                  <TrendIcon className="h-3 w-3 mr-1" />
                  {metric.trend} from last week
                </p>
              )}
              {metric.progress && (
                <Progress value={metric.progress} className="mt-2" />
              )}
              {!metric.trend && !metric.progress && (
                <p className="text-xs text-muted-foreground/60">Active work items</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function RecentActivityFeed() {
  return (
    <Card className="col-span-1 glass card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Activity className="h-5 w-5 text-cyan-400" />
          Recent Activity
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Latest updates from your team and projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((activity) => {
            const IconComponent = activity.icon
            return (
              <div key={activity.id} className="flex items-start space-x-3 group">
                <div className={`p-2 rounded-full bg-muted ${activity.color} group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="h-3 w-3" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground">
                    {activity.message}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground/60">
                    <User className="h-3 w-3 mr-1" />
                    {activity.user} • {activity.timestamp}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4">
          <Button variant="outline" className="w-full glass border-border hover:bg-muted">
            <ArrowRight className="h-4 w-4 mr-2" />
            View All Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function WeeklyProgressChart() {
  return (
    <Card className="col-span-2 glass card-hover">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-cyan-400" />
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
              color: "#22d3ee",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyProgress}>
              <XAxis dataKey="day" />
              <YAxis />
              <Bar dataKey="completed" fill="#10b981" name="Completed" />
              <Bar dataKey="created" fill="#22d3ee" name="Created" />
              <ChartTooltip content={<ChartTooltipContent />} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function PerformanceTrendChart() {
  return (
    <Card className="col-span-1 glass card-hover">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-400" />
          Performance Trend
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Team efficiency over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            efficiency: {
              label: "Efficiency %",
              color: "#a855f7",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceTrend}>
              <XAxis dataKey="month" />
              <YAxis />
              <Area
                type="monotone"
                dataKey="efficiency"
                stroke="#a855f7"
                fill="#a855f7"
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
          <Plus className="h-5 w-5 text-cyan-400" />
          Quick Actions
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Common tasks and shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <Button className="justify-start bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white glow-gradient">
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
                  alert.type === 'info' ? 'bg-cyan-500' : 'bg-emerald-500'
                }`} />
                <span className="text-sm text-foreground/90">{alert.message}</span>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
                {alert.action}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  return (
    <BackgroundGradientAnimation>
      <div className="relative">
        <Spotlight className="top-0 left-0 md:left-60 md:top-0" fill="white" />
        <Grid className="opacity-30" />
        
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
      </div>
    </BackgroundGradientAnimation>
  )
}