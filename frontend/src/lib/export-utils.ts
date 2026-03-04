import Papa from 'papaparse'

export function exportToJSON(data: any, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportToCSV(data: Record<string, any>[], filename: string): void {
  if (data.length === 0) return
  const csv = Papa.unparse(data)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export interface ExportSelections {
  tickets: boolean
  epics: boolean
  projects: boolean
  teamMembers: boolean
  ticketLinks: boolean
  customFields: boolean
  documents: boolean
}

export function generateExportData(selections: ExportSelections): Record<string, any[]> {
  const data: Record<string, any[]> = {}

  if (selections.tickets) {
    data.tickets = JSON.parse(localStorage.getItem('tickets') || '[]')
  }
  if (selections.epics) {
    data.epics = JSON.parse(localStorage.getItem('epics') || '[]')
  }
  if (selections.projects) {
    data.projects = JSON.parse(localStorage.getItem('project_spaces') || '[]')
  }
  if (selections.teamMembers) {
    data.teamMembers = JSON.parse(localStorage.getItem('team_members') || '[]')
  }
  if (selections.ticketLinks) {
    data.ticketLinks = JSON.parse(localStorage.getItem('ticket_links') || '[]')
  }
  if (selections.customFields) {
    data.customFields = JSON.parse(localStorage.getItem('team_custom_fields') || '[]')
  }
  if (selections.documents) {
    data.documents = JSON.parse(localStorage.getItem('documents') || '[]')
  }

  return data
}
