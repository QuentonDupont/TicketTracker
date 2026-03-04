"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, CalendarDays } from "lucide-react"
import { toast } from "sonner"
import { Epic } from "@/types"

interface TicketFormData {
  title: string
  description: string
  current_results: string
  expected_results: string
  status: 'To Do' | 'In Progress' | 'Done'
  priority: 'Low' | 'Medium' | 'High'
  due_date: string
  assignee?: string
  tags: string[]
  epic_id?: number
}

interface TicketFormProps {
  onSubmit: (data: TicketFormData) => void
  initialData?: Partial<TicketFormData>
  mode?: 'create' | 'edit'
}

export function TicketForm({ onSubmit, initialData, mode = 'create' }: TicketFormProps) {
  const [formData, setFormData] = useState<TicketFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    current_results: initialData?.current_results || '',
    expected_results: initialData?.expected_results || '',
    status: initialData?.status || 'To Do',
    priority: initialData?.priority || 'Medium',
    due_date: initialData?.due_date || '',
    assignee: initialData?.assignee || '',
    tags: initialData?.tags || [],
    epic_id: initialData?.epic_id
  })

  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [availableEpics, setAvailableEpics] = useState<Epic[]>([])

  // Load available epics from localStorage
  useEffect(() => {
    try {
      const storedEpics = localStorage.getItem('epics')
      if (storedEpics) {
        const epics: Epic[] = JSON.parse(storedEpics)
        // Only show active epics (not completed)
        const activeEpics = epics.filter(e => e.status !== 'Completed')
        setAvailableEpics(activeEpics)
      }
    } catch (error) {
      console.error('Error loading epics:', error)
    }
  }, [])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.current_results.trim()) {
      newErrors.current_results = 'Current results are required'
    } else if (formData.current_results.trim().length < 10) {
      newErrors.current_results = 'Current results must be at least 10 characters'
    }

    if (!formData.expected_results.trim()) {
      newErrors.expected_results = 'Expected results are required'
    } else if (formData.expected_results.trim().length < 10) {
      newErrors.expected_results = 'Expected results must be at least 10 characters'
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required'
    } else {
      const dueDate = new Date(formData.due_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (dueDate < today) {
        newErrors.due_date = 'Due date cannot be in the past'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
      toast.success(`Ticket ${mode === 'create' ? 'created' : 'updated'} successfully!`)

      if (mode === 'create') {
        // Reset form for new ticket
        setFormData({
          title: '',
          description: '',
          current_results: '',
          expected_results: '',
          status: 'To Do',
          priority: 'Medium',
          due_date: '',
          assignee: '',
          tags: [],
          epic_id: undefined
        })
      }
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const priorityColors = {
    Low: 'bg-green-100 text-green-800 border-green-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    High: 'bg-red-100 text-red-800 border-red-200'
  }

  const statusColors = {
    'To Do': 'bg-gray-100 text-gray-800 border-gray-200',
    'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
    'Ready for Code Review': 'bg-blue-100 text-blue-800 border-blue-200',
    'Ready For QA': 'bg-orange-100 text-orange-800 border-orange-200',
    'In QA': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Ready to Release': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Live': 'bg-green-100 text-green-800 border-green-200'
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          {mode === 'create' ? 'Create New Ticket' : 'Edit Ticket'}
        </CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Fill out the form below to create a new ticket'
            : 'Update the ticket information below'
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
              placeholder="Enter ticket title"
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
              placeholder="Describe the ticket in detail"
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Current Results */}
          <div className="space-y-2">
            <Label htmlFor="current_results">Current Results *</Label>
            <Textarea
              id="current_results"
              value={formData.current_results}
              onChange={(e) => setFormData(prev => ({ ...prev, current_results: e.target.value }))}
              placeholder="Describe what is currently happening or the current state..."
              rows={3}
              className={errors.current_results ? 'border-red-500' : ''}
            />
            {errors.current_results && (
              <p className="text-sm text-red-500">{errors.current_results}</p>
            )}
          </div>

          {/* Expected Results */}
          <div className="space-y-2">
            <Label htmlFor="expected_results">Expected Results *</Label>
            <Textarea
              id="expected_results"
              value={formData.expected_results}
              onChange={(e) => setFormData(prev => ({ ...prev, expected_results: e.target.value }))}
              placeholder="Describe what should happen or the desired outcome..."
              rows={3}
              className={errors.expected_results ? 'border-red-500' : ''}
            />
            {errors.expected_results && (
              <p className="text-sm text-red-500">{errors.expected_results}</p>
            )}
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="To Do">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-gray-500`} />
                      To Do
                    </div>
                  </SelectItem>
                  <SelectItem value="In Progress">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-blue-500`} />
                      In Progress
                    </div>
                  </SelectItem>
                  <SelectItem value="Ready for Code Review">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-blue-600`} />
                      Ready for Code Review
                    </div>
                  </SelectItem>
                  <SelectItem value="Ready For QA">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-orange-500`} />
                      Ready For QA
                    </div>
                  </SelectItem>
                  <SelectItem value="In QA">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-yellow-500`} />
                      In QA
                    </div>
                  </SelectItem>
                  <SelectItem value="Ready to Release">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-indigo-500`} />
                      Ready to Release
                    </div>
                  </SelectItem>
                  <SelectItem value="Live">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-green-500`} />
                      Live
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">
                    <Badge className={priorityColors.Low}>Low</Badge>
                  </SelectItem>
                  <SelectItem value="Medium">
                    <Badge className={priorityColors.Medium}>Medium</Badge>
                  </SelectItem>
                  <SelectItem value="High">
                    <Badge className={priorityColors.High}>High</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date and Assignee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className={errors.due_date ? 'border-red-500' : ''}
              />
              {errors.due_date && (
                <p className="text-sm text-red-500">{errors.due_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select
                value={formData.assignee || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, assignee: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alice">Alice Johnson</SelectItem>
                  <SelectItem value="bob">Bob Wilson</SelectItem>
                  <SelectItem value="charlie">Charlie Brown</SelectItem>
                  <SelectItem value="diana">Diana Prince</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Epic Selection */}
          <div className="space-y-2">
            <Label htmlFor="epic">Epic (Optional)</Label>
            <Select
              value={formData.epic_id ? formData.epic_id.toString() : 'none'}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                epic_id: value === 'none' ? undefined : parseInt(value)
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Link to an epic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Epic</SelectItem>
                {availableEpics.map((epic) => (
                  <SelectItem key={epic.id} value={epic.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: epic.color }}
                      />
                      {epic.title}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableEpics.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No active epics available. Create an epic first to link tickets.
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag and press Enter"
                className="flex-1"
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add Tag
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              {mode === 'create' ? 'Create Ticket' : 'Update Ticket'}
            </Button>
            <Button type="button" variant="outline" onClick={() => {
              // Reset form
              setFormData({
                title: '',
                description: '',
                current_results: '',
                expected_results: '',
                status: 'To Do',
                priority: 'Medium',
                due_date: '',
                assignee: '',
                tags: [],
                epic_id: undefined
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