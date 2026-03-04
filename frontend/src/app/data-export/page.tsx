"use client"

import { useState } from 'react'
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { exportToJSON, exportToCSV, generateExportData, ExportSelections } from "@/lib/export-utils"
import { Database, Download, FileJson, FileSpreadsheet } from "lucide-react"

export default function DataExportPage() {
  const [format, setFormat] = useState<'json' | 'csv'>('json')
  const [selections, setSelections] = useState<ExportSelections>({
    tickets: true,
    epics: true,
    projects: true,
    teamMembers: true,
    ticketLinks: true,
    customFields: true,
    documents: true,
  })

  const toggleSelection = (key: keyof ExportSelections) => {
    setSelections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const getCount = (key: string): number => {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data).length : 0
    } catch { return 0 }
  }

  const dataTypes = [
    { key: 'tickets' as const, label: 'Tickets', storageKey: 'tickets' },
    { key: 'epics' as const, label: 'Epics', storageKey: 'epics' },
    { key: 'projects' as const, label: 'Project Spaces', storageKey: 'project_spaces' },
    { key: 'teamMembers' as const, label: 'Team Members', storageKey: 'team_members' },
    { key: 'ticketLinks' as const, label: 'Ticket Links', storageKey: 'ticket_links' },
    { key: 'customFields' as const, label: 'Custom Fields', storageKey: 'team_custom_fields' },
    { key: 'documents' as const, label: 'Documents', storageKey: 'documents' },
  ]

  const selectedCount = Object.values(selections).filter(Boolean).length
  const totalItems = dataTypes.reduce((sum, dt) => sum + (selections[dt.key] ? getCount(dt.storageKey) : 0), 0)

  const handleExport = () => {
    if (selectedCount === 0) {
      toast.error('Select at least one data type to export')
      return
    }

    const data = generateExportData(selections)
    const timestamp = new Date().toISOString().split('T')[0]

    if (format === 'json') {
      exportToJSON(data, `tickettracker-export-${timestamp}`)
      toast.success('Data exported as JSON')
    } else {
      // For CSV, export each type as a separate file
      Object.entries(data).forEach(([key, items]) => {
        if (items.length > 0) {
          // Flatten nested objects for CSV
          const flattened = items.map(item => {
            const flat: Record<string, any> = {}
            Object.entries(item).forEach(([k, v]) => {
              flat[k] = typeof v === 'object' ? JSON.stringify(v) : v
            })
            return flat
          })
          exportToCSV(flattened, `tickettracker-${key}-${timestamp}`)
        }
      })
      toast.success('Data exported as CSV files')
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Database className="h-8 w-8" />
            Data Export
          </h1>
          <p className="text-muted-foreground mt-1">
            Export your data in JSON or CSV format
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Data to Export</CardTitle>
            <CardDescription>Choose which data types to include in your export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dataTypes.map(dt => (
              <div key={dt.key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={dt.key}
                    checked={selections[dt.key]}
                    onCheckedChange={() => toggleSelection(dt.key)}
                  />
                  <Label htmlFor={dt.key} className="cursor-pointer">{dt.label}</Label>
                </div>
                <Badge variant="secondary">{getCount(dt.storageKey)} items</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Format</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={format} onValueChange={(v) => setFormat(v as 'json' | 'csv')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    JSON — Single file with all selected data
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV — Separate file per data type
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="p-4 rounded-lg bg-muted/50 text-sm">
              <p className="font-medium">Export summary:</p>
              <p className="text-muted-foreground">{selectedCount} data type(s) selected &middot; {totalItems} total items</p>
            </div>

            <Button onClick={handleExport} disabled={selectedCount === 0} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
