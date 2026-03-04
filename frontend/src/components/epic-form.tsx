"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Target, Calendar } from "lucide-react"
import { toast } from "sonner"
import { Epic, EpicStatus } from "@/types"

interface EpicFormData {
  title: string
  description: string
  status: EpicStatus
  color: string
  start_date: string
  end_date: string
  owner?: string
}

interface EpicFormProps {
  onSubmit: (data: EpicFormData) => void
  initialData?: Partial<EpicFormData>
  mode?: 'create' | 'edit'
}

const predefinedColors = [
  { name: 'Cyan', value: '#3b82f6' },
  { name: 'Purple', value: '#1e40af' },
  { name: 'Green', value: '#10b981' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Pink', value: '#60a5fa' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Emerald', value: '#059669' },
]

export function EpicForm({ onSubmit, initialData, mode = 'create' }: EpicFormProps) {
  const [formData, setFormData] = useState<EpicFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'Planning',
    color: initialData?.color || '#3b82f6',
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
    owner: initialData?.owner || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required'
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required'
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)

      if (endDate < startDate) {
        newErrors.end_date = 'End date must be after start date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
      toast.success(`Epic ${mode === 'create' ? 'created' : 'updated'} successfully!`)

      if (mode === 'create') {
        // Reset form for new epic
        setFormData({
          title: '',
          description: '',
          status: 'Planning',
          color: '#3b82f6',
          start_date: '',
          end_date: '',
          owner: ''
        })
      }
    }
  }

  const statusColors: Record<EpicStatus, string> = {
    'Planning': 'bg-gray-100 text-gray-800 border-gray-200',
    'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
    'Completed': 'bg-green-100 text-green-800 border-green-200',
    'On Hold': 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {mode === 'create' ? 'Create New Epic' : 'Edit Epic'}
        </CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Fill out the form below to create a new epic'
            : 'Update the epic information below'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter epic title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the epic in detail"
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Status and Color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as EpicStatus }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planning">
                    <Badge className={statusColors.Planning}>Planning</Badge>
                  </SelectItem>
                  <SelectItem value="In Progress">
                    <Badge className={statusColors['In Progress']}>In Progress</Badge>
                  </SelectItem>
                  <SelectItem value="On Hold">
                    <Badge className={statusColors['On Hold']}>On Hold</Badge>
                  </SelectItem>
                  <SelectItem value="Completed">
                    <Badge className={statusColors.Completed}>Completed</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Theme Color</Label>
              <Select
                value={formData.color}
                onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedColors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: color.value }}
                        />
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Start Date and End Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                className={errors.start_date ? 'border-red-500' : ''}
              />
              {errors.start_date && (
                <p className="text-sm text-red-500">{errors.start_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Target End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                className={errors.end_date ? 'border-red-500' : ''}
              />
              {errors.end_date && (
                <p className="text-sm text-red-500">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Owner */}
          <div className="space-y-2">
            <Label htmlFor="owner">Epic Owner</Label>
            <Select
              value={formData.owner || ''}
              onValueChange={(value) => setFormData(prev => ({ ...prev, owner: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select epic owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Alice Johnson">Alice Johnson</SelectItem>
                <SelectItem value="Bob Wilson">Bob Wilson</SelectItem>
                <SelectItem value="Charlie Brown">Charlie Brown</SelectItem>
                <SelectItem value="Diana Prince">Diana Prince</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color Preview */}
          <div className="space-y-2">
            <Label>Color Preview</Label>
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div
                className="w-12 h-12 rounded-lg border-2 border-border"
                style={{ backgroundColor: formData.color }}
              />
              <div>
                <p className="text-sm font-medium">Selected Color</p>
                <p className="text-xs text-muted-foreground font-mono">{formData.color}</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              <Target className="h-4 w-4 mr-2" />
              {mode === 'create' ? 'Create Epic' : 'Update Epic'}
            </Button>
            <Button type="button" variant="outline" onClick={() => {
              // Reset form
              setFormData({
                title: '',
                description: '',
                status: 'Planning',
                color: '#3b82f6',
                start_date: '',
                end_date: '',
                owner: ''
              })
              setErrors({})
            }}>
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
