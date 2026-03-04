import { Ticket, Epic, ProjectSpace, TeamMember, TicketActivity } from '@/types'
import { getRecentActivities } from './activity-storage'
import { getTeamMembers } from './team-storage'

function getTickets(): Ticket[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem('tickets')
    return data ? JSON.parse(data) : []
  } catch { return [] }
}

function getEpics(): Epic[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem('epics')
    return data ? JSON.parse(data) : []
  } catch { return [] }
}

function getProjectSpaces(): ProjectSpace[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem('project_spaces')
    return data ? JSON.parse(data) : []
  } catch { return [] }
}

export interface DashboardMetrics {
  totalTickets: number
  openTickets: number
  completedTickets: number
  activeProjects: number
  teamMembers: number
  completionRate: number
  avgResolutionTime: number
  overdueTickets: number
}

const COMPLETED_STATUSES = ['Live'] as const
const OPEN_STATUSES = ['To Do', 'In Progress', 'Ready for Code Review', 'Ready For QA', 'In QA', 'Ready to Release'] as const

export function getDashboardMetrics(): DashboardMetrics {
  const tickets = getTickets()
  const projects = getProjectSpaces()
  const members = getTeamMembers()

  const total = tickets.length
  const completed = tickets.filter(t => COMPLETED_STATUSES.includes(t.status as any)).length
  const open = total - completed
  const overdue = tickets.filter(t => {
    if (!t.due_date || COMPLETED_STATUSES.includes(t.status as any)) return false
    return new Date(t.due_date) < new Date()
  }).length

  const avgResolution = members.length > 0
    ? members.reduce((sum, m) => sum + m.avgResolutionTime, 0) / members.length
    : 0

  return {
    totalTickets: total,
    openTickets: open,
    completedTickets: completed,
    activeProjects: projects.length,
    teamMembers: members.length,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    avgResolutionTime: Math.round(avgResolution * 10) / 10,
    overdueTickets: overdue,
  }
}

export function getStatusDistribution(): { name: string; value: number; color: string }[] {
  const tickets = getTickets()
  const statusColors: Record<string, string> = {
    'To Do': '#6366f1',
    'In Progress': '#f59e0b',
    'Ready for Code Review': '#8b5cf6',
    'Ready For QA': '#ec4899',
    'In QA': '#14b8a6',
    'Ready to Release': '#06b6d4',
    'Live': '#22c55e',
  }

  const counts: Record<string, number> = {}
  tickets.forEach(t => {
    counts[t.status] = (counts[t.status] || 0) + 1
  })

  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    color: statusColors[name] || '#94a3b8',
  }))
}

export function getPriorityDistribution(): { name: string; value: number; color: string }[] {
  const tickets = getTickets()
  const priorityColors: Record<string, string> = {
    Low: '#22c55e',
    Medium: '#f59e0b',
    High: '#ef4444',
  }

  const counts: Record<string, number> = {}
  tickets.forEach(t => {
    counts[t.priority] = (counts[t.priority] || 0) + 1
  })

  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    color: priorityColors[name] || '#94a3b8',
  }))
}

export function getTeamPerformance(): { name: string; completedTickets: number; performanceScore: number }[] {
  const members = getTeamMembers()
  return members.map(m => ({
    name: m.name,
    completedTickets: m.completedTickets,
    performanceScore: m.performanceScore,
  }))
}

export function getProjectMetrics(): { name: string; total: number; completed: number; color: string }[] {
  const projects = getProjectSpaces()
  const tickets = getTickets()

  return projects.map(p => {
    const projectTickets = tickets.filter(t => t.project_space_id === p.id)
    const completed = projectTickets.filter(t => COMPLETED_STATUSES.includes(t.status as any)).length
    return {
      name: p.name,
      total: projectTickets.length,
      completed,
      color: p.color,
    }
  })
}

export function getWeeklyProgress(): { day: string; completed: number; created: number }[] {
  const tickets = getTickets()
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const result = days.map(day => ({ day, completed: 0, created: 0 }))

  tickets.forEach(t => {
    const created = new Date(t.created_date)
    if (created >= weekStart) {
      result[created.getDay()].created++
    }
  })

  // For completed, count tickets with 'Live' status that were created this week as a proxy
  tickets.forEach(t => {
    if (COMPLETED_STATUSES.includes(t.status as any)) {
      const created = new Date(t.created_date)
      if (created >= weekStart) {
        result[created.getDay()].completed++
      }
    }
  })

  return result
}

export function getMonthlyTrend(months: number = 6): { month: string; created: number; completed: number }[] {
  const tickets = getTickets()
  const now = new Date()
  const result: { month: string; created: number; completed: number }[] = []
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`
    const label = monthNames[date.getMonth()]

    const created = tickets.filter(t => {
      const d = new Date(t.created_date)
      return `${d.getFullYear()}-${d.getMonth()}` === monthKey
    }).length

    const completed = tickets.filter(t => {
      if (!COMPLETED_STATUSES.includes(t.status as any)) return false
      const d = new Date(t.created_date)
      return `${d.getFullYear()}-${d.getMonth()}` === monthKey
    }).length

    result.push({ month: label, created, completed })
  }

  return result
}

export function getRecentActivityFeed(limit: number = 5): TicketActivity[] {
  return getRecentActivities(limit)
}
