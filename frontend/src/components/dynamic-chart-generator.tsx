"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  AreaChart as AreaChartIcon,
  TrendingUp,
  Download,
  Settings,
  Palette,
  Calendar,
  Users,
  Filter,
  RefreshCw
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from "date-fns"

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

interface ChartConfig {
  type: 'bar' | 'line' | 'area' | 'pie'
  dataSource: 'status' | 'priority' | 'assignee' | 'timeline' | 'tags'
  timeRange: 'week' | 'month' | 'quarter' | 'year' | 'all'
  colorScheme: 'default' | 'blue' | 'green' | 'purple' | 'red'
}

interface DynamicChartGeneratorProps {
  tickets: Ticket[]
  title?: string
  className?: string
}

const CHART_TYPES = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'line', label: 'Line Chart', icon: LineChartIcon },
  { value: 'area', label: 'Area Chart', icon: AreaChartIcon },
  { value: 'pie', label: 'Pie Chart', icon: PieChartIcon },
]

const DATA_SOURCES = [
  { value: 'status', label: 'Ticket Status' },
  { value: 'priority', label: 'Priority Distribution' },
  { value: 'assignee', label: 'Tickets by Assignee' },
  { value: 'timeline', label: 'Timeline Analysis' },
  { value: 'tags', label: 'Tags Distribution' }
]

const TIME_RANGES = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' }
]

const COLOR_SCHEMES = {
  default: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff7f'],
  blue: ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
  green: ['#166534', '#16a34a', '#22c55e', '#4ade80', '#86efac'],
  purple: ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
  red: ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca']
}

export function DynamicChartGenerator({
  tickets,
  title = "Data Visualization",
  className
}: DynamicChartGeneratorProps) {
  const [config, setConfig] = useState<ChartConfig>({
    type: 'bar',
    dataSource: 'status',
    timeRange: 'all',
    colorScheme: 'default'
  })

  // Filter tickets based on time range
  const filteredTickets = useMemo(() => {
    if (config.timeRange === 'all') return tickets

    const now = new Date()
    let startDate: Date

    switch (config.timeRange) {
      case 'week':
        startDate = startOfWeek(now)
        break
      case 'month':
        startDate = startOfMonth(now)
        break
      case 'quarter':
        startDate = subMonths(startOfMonth(now), 3)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        return tickets
    }

    return tickets.filter(ticket => {
      const ticketDate = new Date(ticket.created_date)
      return ticketDate >= startDate
    })
  }, [tickets, config.timeRange])

  // Generate chart data based on configuration
  const chartData = useMemo(() => {
    switch (config.dataSource) {
      case 'status':
        const statusCounts = filteredTickets.reduce((acc, ticket) => {
          acc[ticket.status] = (acc[ticket.status] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        return Object.entries(statusCounts).map(([status, count]) => ({
          name: status,
          value: count,
          fill: COLOR_SCHEMES[config.colorScheme][['To Do', 'In Progress', 'Done'].indexOf(status)]
        }))

      case 'priority':
        const priorityCounts = filteredTickets.reduce((acc, ticket) => {
          acc[ticket.priority] = (acc[ticket.priority] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        return Object.entries(priorityCounts).map(([priority, count], index) => ({
          name: priority,
          value: count,
          fill: COLOR_SCHEMES[config.colorScheme][index]
        }))

      case 'assignee':
        const assigneeCounts = filteredTickets.reduce((acc, ticket) => {
          const assignee = ticket.assignee || 'Unassigned'
          acc[assignee] = (acc[assignee] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        return Object.entries(assigneeCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10) // Top 10 assignees
          .map(([assignee, count], index) => ({
            name: assignee.length > 15 ? `${assignee.substring(0, 15)}...` : assignee,
            value: count,
            fill: COLOR_SCHEMES[config.colorScheme][index % COLOR_SCHEMES[config.colorScheme].length]
          }))

      case 'timeline':
        // Group tickets by creation date (by week for better visualization)
        const timelineData = filteredTickets.reduce((acc, ticket) => {
          const date = new Date(ticket.created_date)
          const weekStart = startOfWeek(date)
          const weekKey = format(weekStart, 'MMM dd')

          if (!acc[weekKey]) {
            acc[weekKey] = { name: weekKey, created: 0, completed: 0 }
          }

          acc[weekKey].created++
          if (ticket.status === 'Done') {
            acc[weekKey].completed++
          }

          return acc
        }, {} as Record<string, { name: string; created: number; completed: number }>)

        return Object.values(timelineData).sort((a, b) =>
          new Date(a.name + ', ' + new Date().getFullYear()).getTime() -
          new Date(b.name + ', ' + new Date().getFullYear()).getTime()
        )

      case 'tags':
        const tagCounts = filteredTickets.reduce((acc, ticket) => {
          if (ticket.tags && ticket.tags.length > 0) {
            ticket.tags.forEach(tag => {
              acc[tag] = (acc[tag] || 0) + 1
            })
          }
          return acc
        }, {} as Record<string, number>)

        return Object.entries(tagCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10) // Top 10 tags
          .map(([tag, count], index) => ({
            name: tag,
            value: count,
            fill: COLOR_SCHEMES[config.colorScheme][index % COLOR_SCHEMES[config.colorScheme].length]
          }))

      default:
        return []
    }
  }, [filteredTickets, config])

  const updateConfig = (key: keyof ChartConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const exportChart = () => {
    // In a real implementation, you would export the chart as PNG/PDF
    console.log('Exporting chart...', config, chartData)
  }

  const renderChart = () => {
    const colors = COLOR_SCHEMES[config.colorScheme]

    switch (config.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill={colors[0]} />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {config.dataSource === 'timeline' ? (
                <>
                  <Line type="monotone" dataKey="created" stroke={colors[0]} strokeWidth={2} />
                  <Line type="monotone" dataKey="completed" stroke={colors[1]} strokeWidth={2} />
                </>
              ) : (
                <Line type="monotone" dataKey="value" stroke={colors[0]} strokeWidth={2} />
              )}
            </LineChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {config.dataSource === 'timeline' ? (
                <>
                  <Area type="monotone" dataKey="created" stackId="1" stroke={colors[0]} fill={colors[0]} />
                  <Area type="monotone" dataKey="completed" stackId="1" stroke={colors[1]} fill={colors[1]} />
                </>
              ) : (
                <Area type="monotone" dataKey="value" stroke={colors[0]} fill={colors[0]} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>
              Interactive data visualization for {filteredTickets.length} tickets
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {config.timeRange === 'all' ? 'All Time' : TIME_RANGES.find(r => r.value === config.timeRange)?.label}
            </Badge>
            <Button size="sm" variant="outline" onClick={exportChart}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Configuration Controls */}
        <Tabs defaultValue="data" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Source</Label>
                <Select value={config.dataSource} onValueChange={(value) => updateConfig('dataSource', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATA_SOURCES.map(source => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Time Range</Label>
                <Select value={config.timeRange} onValueChange={(value) => updateConfig('timeRange', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_RANGES.map(range => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chart" className="space-y-4">
            <div className="space-y-2">
              <Label>Chart Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {CHART_TYPES.map(type => (
                  <Button
                    key={type.value}
                    variant={config.type === type.value ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => updateConfig('type', type.value)}
                  >
                    <type.icon className="h-4 w-4 mr-2" />
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
            <div className="space-y-2">
              <Label>Color Scheme</Label>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(COLOR_SCHEMES).map(([scheme, colors]) => (
                  <Button
                    key={scheme}
                    variant={config.colorScheme === scheme ? "default" : "outline"}
                    className="h-auto p-2 flex-col"
                    onClick={() => updateConfig('colorScheme', scheme)}
                  >
                    <div className="flex gap-1 mb-1">
                      {colors.slice(0, 3).map((color, index) => (
                        <div
                          key={index}
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="text-xs capitalize">{scheme}</span>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        {/* Chart Display */}
        <div className="min-h-[400px]">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center space-y-2">
                <BarChart3 className="h-12 w-12 mx-auto opacity-50" />
                <p>No data available for the selected configuration</p>
                <p className="text-sm">Try adjusting your filters or time range</p>
              </div>
            </div>
          ) : (
            renderChart()
          )}
        </div>

        {/* Chart Summary */}
        {chartData.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Data points: {chartData.length}</span>
              <span>Total tickets: {filteredTickets.length}</span>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setConfig({ type: 'bar', dataSource: 'status', timeRange: 'all', colorScheme: 'default' })}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}