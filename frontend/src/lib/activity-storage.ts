import { TicketActivity, TicketActivityType } from '@/types'

const ACTIVITIES_KEY = 'ticket_activities'

export function getAllActivities(): TicketActivity[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(ACTIVITIES_KEY)
    if (!data) return []
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading activities:', error)
    return []
  }
}

function saveActivities(activities: TicketActivity[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities))
  } catch (error) {
    console.error('Error saving activities:', error)
  }
}

export function getActivitiesForTicket(ticketId: number): TicketActivity[] {
  return getAllActivities()
    .filter(a => a.ticket_id === ticketId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function addActivity(activity: Omit<TicketActivity, 'id' | 'timestamp'>): TicketActivity {
  const activities = getAllActivities()
  const newActivity: TicketActivity = {
    ...activity,
    id: Date.now() + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
  }
  activities.push(newActivity)
  saveActivities(activities)
  return newActivity
}

export function getRecentActivities(limit: number = 10): TicketActivity[] {
  return getAllActivities()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
}

export function logTicketChange(
  ticketId: number,
  type: TicketActivityType,
  description: string,
  userName: string,
  fieldName?: string,
  oldValue?: string,
  newValue?: string
): TicketActivity {
  return addActivity({
    ticket_id: ticketId,
    type,
    description,
    user_name: userName,
    field_name: fieldName,
    old_value: oldValue,
    new_value: newValue,
  })
}
