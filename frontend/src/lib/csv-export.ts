import { Ticket } from '@/types'

function escapeCSVValue(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return ''
  const str = String(value)
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportTicketsToCSV(tickets: Ticket[], filename: string): void {
  const headers = [
    'ID',
    'Title',
    'Description',
    'Current Results',
    'Expected Results',
    'Status',
    'Priority',
    'Assignee',
    'Due Date',
    'Created Date',
    'Tags',
    'Epic ID',
    'Project Space ID',
  ]

  const rows = tickets.map(ticket => [
    escapeCSVValue(ticket.id),
    escapeCSVValue(ticket.title),
    escapeCSVValue(ticket.description),
    escapeCSVValue(ticket.current_results),
    escapeCSVValue(ticket.expected_results),
    escapeCSVValue(ticket.status),
    escapeCSVValue(ticket.priority),
    escapeCSVValue(ticket.assignee),
    escapeCSVValue(ticket.due_date),
    escapeCSVValue(ticket.created_date),
    escapeCSVValue(ticket.tags?.join('; ')),
    escapeCSVValue(ticket.epic_id),
    escapeCSVValue(ticket.project_space_id),
  ])

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
