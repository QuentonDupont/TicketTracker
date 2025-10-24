"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import Papa from "papaparse"
import {
  Upload,
  FileText,
  Check,
  X,
  AlertCircle,
  Download,
  Eye,
  Settings,
  Database
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface CSVColumn {
  name: string
  type: 'string' | 'number' | 'date' | 'boolean'
  mappedTo?: string
  sample?: string
}

interface CSVData {
  headers: string[]
  rows: any[][]
  columns: CSVColumn[]
}

interface ColumnMapping {
  csvColumn: string
  ticketField: string
}

interface CSVUploadProps {
  onDataImported: (data: any[]) => void
  onClose?: () => void
}

const TICKET_FIELDS = [
  { value: 'title', label: 'Title', required: true },
  { value: 'description', label: 'Description', required: false },
  { value: 'status', label: 'Status', required: false },
  { value: 'priority', label: 'Priority', required: false },
  { value: 'due_date', label: 'Due Date', required: false },
  { value: 'assignee', label: 'Assignee', required: false },
  { value: 'tags', label: 'Tags', required: false },
  { value: 'created_date', label: 'Created Date', required: false },
  { value: '', label: 'Skip Column', required: false }
]

const STATUS_VALUES = ['To Do', 'In Progress', 'Done']
const PRIORITY_VALUES = ['Low', 'Medium', 'High']

export function CSVUpload({ onDataImported, onClose }: CSVUploadProps) {
  const [csvData, setCsvData] = useState<CSVData | null>(null)
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [transformedData, setTransformedData] = useState<any[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setIsProcessing(true)
      setUploadProgress(0)
      setErrors([])

      Papa.parse(file, {
        header: false,
        complete: (results) => {
          if (results.errors.length > 0) {
            setErrors(results.errors.map(error => error.message))
            setIsProcessing(false)
            return
          }

          const [headers, ...rows] = results.data as string[][]

          // Analyze columns
          const columns: CSVColumn[] = headers.map((header, index) => {
            const sample = rows[0]?.[index] || ''
            let type: CSVColumn['type'] = 'string'

            // Simple type detection
            if (sample && !isNaN(Number(sample))) {
              type = 'number'
            } else if (sample && /^\d{4}-\d{2}-\d{2}/.test(sample)) {
              type = 'date'
            } else if (sample && (sample.toLowerCase() === 'true' || sample.toLowerCase() === 'false')) {
              type = 'boolean'
            }

            return {
              name: header,
              type,
              sample: sample?.substring(0, 50) || 'No data',
              mappedTo: undefined
            }
          })

          setCsvData({ headers, rows, columns })

          // Auto-suggest mappings
          const autoMappings: ColumnMapping[] = columns.map(col => {
            const lowerName = col.name.toLowerCase()
            let suggestedField = ''

            if (lowerName.includes('title') || lowerName.includes('subject')) {
              suggestedField = 'title'
            } else if (lowerName.includes('description') || lowerName.includes('desc')) {
              suggestedField = 'description'
            } else if (lowerName.includes('status')) {
              suggestedField = 'status'
            } else if (lowerName.includes('priority')) {
              suggestedField = 'priority'
            } else if (lowerName.includes('due') || lowerName.includes('deadline')) {
              suggestedField = 'due_date'
            } else if (lowerName.includes('assign') || lowerName.includes('owner')) {
              suggestedField = 'assignee'
            } else if (lowerName.includes('tag') || lowerName.includes('label')) {
              suggestedField = 'tags'
            } else if (lowerName.includes('created')) {
              suggestedField = 'created_date'
            }

            return {
              csvColumn: col.name,
              ticketField: suggestedField
            }
          })

          setColumnMappings(autoMappings)
          setUploadProgress(100)
          setIsProcessing(false)
        },
        error: (error) => {
          setErrors([error.message])
          setIsProcessing(false)
        }
      })
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls', '.xlsx']
    },
    multiple: false
  })

  const updateMapping = (csvColumn: string, ticketField: string) => {
    setColumnMappings(prev =>
      prev.map(mapping =>
        mapping.csvColumn === csvColumn
          ? { ...mapping, ticketField }
          : mapping
      )
    )
  }

  const validateData = (data: any[]): string[] => {
    const validationErrors: string[] = []

    data.forEach((row, index) => {
      if (!row.title || row.title.trim() === '') {
        validationErrors.push(`Row ${index + 1}: Title is required`)
      }

      if (row.status && !STATUS_VALUES.includes(row.status)) {
        validationErrors.push(`Row ${index + 1}: Invalid status '${row.status}'. Must be one of: ${STATUS_VALUES.join(', ')}`)
      }

      if (row.priority && !PRIORITY_VALUES.includes(row.priority)) {
        validationErrors.push(`Row ${index + 1}: Invalid priority '${row.priority}'. Must be one of: ${PRIORITY_VALUES.join(', ')}`)
      }

      if (row.due_date && isNaN(Date.parse(row.due_date))) {
        validationErrors.push(`Row ${index + 1}: Invalid due date '${row.due_date}'`)
      }
    })

    return validationErrors
  }

  const transformData = () => {
    if (!csvData) return

    const transformed = csvData.rows.map((row, rowIndex) => {
      const ticketData: any = {
        id: Date.now() + rowIndex, // Temporary ID
        created_date: new Date().toISOString()
      }

      columnMappings.forEach(mapping => {
        if (mapping.ticketField && mapping.ticketField !== '') {
          const columnIndex = csvData.headers.indexOf(mapping.csvColumn)
          if (columnIndex !== -1) {
            let value = row[columnIndex]

            // Transform data based on field type
            switch (mapping.ticketField) {
              case 'status':
                if (!value) value = 'To Do'
                break
              case 'priority':
                if (!value) value = 'Medium'
                break
              case 'tags':
                if (value) {
                  value = value.split(',').map((tag: string) => tag.trim()).filter(Boolean)
                }
                break
              case 'due_date':
              case 'created_date':
                if (value) {
                  const date = new Date(value)
                  if (!isNaN(date.getTime())) {
                    value = date.toISOString().split('T')[0] // Format as YYYY-MM-DD
                  }
                }
                break
            }

            ticketData[mapping.ticketField] = value
          }
        }
      })

      return ticketData
    })

    setTransformedData(transformed)

    const validationErrors = validateData(transformed)
    setErrors(validationErrors)

    return transformed
  }

  const handleImport = () => {
    const data = transformData()
    if (data && errors.length === 0) {
      onDataImported(data)
      onClose?.()
    }
  }

  const handlePreview = () => {
    transformData()
    setShowPreview(true)
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {!csvData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload CSV File
            </CardTitle>
            <CardDescription>
              Import ticket data from a CSV file. Supports drag and drop.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive && "border-primary bg-primary/5"
              )}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                {isDragActive ? (
                  <p className="text-lg font-medium">Drop the CSV file here...</p>
                ) : (
                  <>
                    <p className="text-lg font-medium">
                      Drag and drop a CSV file here, or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports .csv, .xls, and .xlsx files
                    </p>
                  </>
                )}
              </div>
            </div>

            {isProcessing && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Processing file...</span>
                  <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Column Mapping */}
      {csvData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Map CSV Columns to Ticket Fields
            </CardTitle>
            <CardDescription>
              Choose which CSV columns correspond to ticket fields. Required fields are marked with an asterisk.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {csvData.columns.map((column, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{column.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Sample: "{column.sample}"
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {column.type}
                  </Badge>
                  <Select
                    value={columnMappings.find(m => m.csvColumn === column.name)?.ticketField || ''}
                    onValueChange={(value) => updateMapping(column.name, value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select field..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TICKET_FIELDS.map(field => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium">Please fix the following errors:</div>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      {csvData && (
        <div className="flex items-center gap-3">
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview Data
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Data Preview</DialogTitle>
                <DialogDescription>
                  Preview of {transformedData.length} tickets that will be imported
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-auto max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Assignee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transformedData.slice(0, 10).map((ticket, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{ticket.title}</TableCell>
                        <TableCell>{ticket.status || 'To Do'}</TableCell>
                        <TableCell>{ticket.priority || 'Medium'}</TableCell>
                        <TableCell>{ticket.due_date || '-'}</TableCell>
                        <TableCell>{ticket.assignee || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {transformedData.length > 10 && (
                  <div className="text-center text-sm text-muted-foreground py-2">
                    ... and {transformedData.length - 10} more tickets
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={handleImport}
            disabled={errors.length > 0 || !columnMappings.some(m => m.ticketField === 'title')}
            className="flex-1"
          >
            <Database className="h-4 w-4 mr-2" />
            Import {csvData?.rows.length} Tickets
          </Button>

          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  )
}