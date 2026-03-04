"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Plus,
  GripVertical,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Type,
  Hash,
  Calendar as CalendarIcon,
  List,
  ListChecks,
  ToggleLeft,
  X
} from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CustomFieldDefinition, CustomFieldType } from '@/types'
import {
  getCustomFields,
  addCustomField,
  updateCustomField,
  deleteCustomField,
  reorderCustomFields
} from '@/lib/team-storage'
import { toast } from 'sonner'

// Field type icons and labels
const fieldTypeConfig: Record<CustomFieldType, { icon: React.ElementType, label: string, color: string }> = {
  text: { icon: Type, label: 'Text', color: 'bg-blue-500' },
  number: { icon: Hash, label: 'Number', color: 'bg-green-500' },
  date: { icon: CalendarIcon, label: 'Date', color: 'bg-blue-600' },
  select: { icon: List, label: 'Select', color: 'bg-orange-500' },
  multiselect: { icon: ListChecks, label: 'Multi-Select', color: 'bg-blue-500' },
  boolean: { icon: ToggleLeft, label: 'Toggle', color: 'bg-blue-600' }
}

// Sortable row component
function SortableRow({ field, isSelected, onSelect, onEdit, onDelete, onPreview }: {
  field: CustomFieldDefinition
  isSelected: boolean
  onSelect: (checked: boolean) => void
  onEdit: () => void
  onDelete: () => void
  onPreview: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const typeInfo = fieldTypeConfig[field.type]
  const TypeIcon = typeInfo.icon

  return (
    <TableRow ref={setNodeRef} style={style} className={isDragging ? 'bg-muted' : ''}>
      <TableCell className="w-12">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
      </TableCell>
      <TableCell className="w-12">
        <Checkbox checked={isSelected} onCheckedChange={onSelect} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded ${typeInfo.color}`}>
            <TypeIcon className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-medium">{field.label}</div>
            {field.helpText && (
              <div className="text-xs text-muted-foreground">{field.helpText}</div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{typeInfo.label}</Badge>
      </TableCell>
      <TableCell>
        <Switch checked={field.required} onCheckedChange={(checked) => {
          updateCustomField(field.id, { required: checked })
          toast.success('Field updated')
        }} />
      </TableCell>
      <TableCell>
        {field.options && (
          <Badge variant="secondary" className="text-xs">
            {field.options.length} options
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={onPreview}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

// Field Form Dialog
function FieldFormDialog({ field, open, onOpenChange, onSave }: {
  field?: CustomFieldDefinition
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState<Partial<CustomFieldDefinition>>({
    label: '',
    type: 'text',
    required: false,
    helpText: '',
    options: [],
    defaultValue: ''
  })
  const [optionsInput, setOptionsInput] = useState('')

  useEffect(() => {
    if (field) {
      setFormData(field)
      setOptionsInput(field.options?.join('\n') || '')
    } else {
      setFormData({
        label: '',
        type: 'text',
        required: false,
        helpText: '',
        options: [],
        defaultValue: ''
      })
      setOptionsInput('')
    }
  }, [field, open])

  const handleSave = () => {
    if (!formData.label || formData.label.length < 2) {
      toast.error('Label must be at least 2 characters')
      return
    }

    if ((formData.type === 'select' || formData.type === 'multiselect') && optionsInput.trim().length === 0) {
      toast.error('Select fields must have at least one option')
      return
    }

    const options = (formData.type === 'select' || formData.type === 'multiselect')
      ? optionsInput.split('\n').filter(o => o.trim().length > 0)
      : undefined

    if (field) {
      // Update existing
      updateCustomField(field.id, { ...formData, options })
      toast.success('Field updated successfully')
    } else {
      // Create new
      addCustomField({
        id: `field_${Date.now()}`,
        ...formData,
        options
      } as CustomFieldDefinition)
      toast.success('Field created successfully')
    }

    onSave()
    onOpenChange(false)
  }

  const showOptionsInput = formData.type === 'select' || formData.type === 'multiselect'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{field ? 'Edit Field' : 'Add New Field'}</DialogTitle>
          <DialogDescription>
            {field ? 'Update the custom field configuration' : 'Create a new custom field for team members'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="label">Field Label *</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="e.g., Certification"
            />
          </div>

          <div>
            <Label htmlFor="type">Field Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as CustomFieldType })}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(fieldTypeConfig).map(([type, config]) => {
                  const Icon = config.icon
                  return (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {showOptionsInput && (
            <div>
              <Label htmlFor="options">Options (one per line) *</Label>
              <Textarea
                id="options"
                value={optionsInput}
                onChange={(e) => setOptionsInput(e.target.value)}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
                rows={5}
              />
            </div>
          )}

          <div>
            <Label htmlFor="helpText">Help Text</Label>
            <Textarea
              id="helpText"
              value={formData.helpText}
              onChange={(e) => setFormData({ ...formData, helpText: e.target.value })}
              placeholder="Optional guidance for this field"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="required"
              checked={formData.required}
              onCheckedChange={(checked) => setFormData({ ...formData, required: checked })}
            />
            <Label htmlFor="required">Required field</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>{field ? 'Update' : 'Create'} Field</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Preview Dialog
function PreviewDialog({ field, open, onOpenChange }: {
  field: CustomFieldDefinition | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!field) return null

  const typeInfo = fieldTypeConfig[field.type]
  const TypeIcon = typeInfo.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Field Preview</DialogTitle>
          <DialogDescription>
            How this field will appear on team member detail pages
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded ${typeInfo.color}`}>
              <TypeIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="font-medium flex items-center gap-2">
                {field.label}
                {field.required && <span className="text-destructive">*</span>}
              </div>
              {field.helpText && (
                <div className="text-xs text-muted-foreground">{field.helpText}</div>
              )}
            </div>
          </div>

          <div>
            {field.type === 'text' && <Input placeholder="Enter text..." />}
            {field.type === 'number' && <Input type="number" placeholder="Enter number..." />}
            {field.type === 'date' && <Input type="date" />}
            {field.type === 'boolean' && (
              <div className="flex items-center space-x-2">
                <Switch />
                <span className="text-sm">Toggle</span>
              </div>
            )}
            {field.type === 'select' && (
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select option..." />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option, index) => (
                    <SelectItem key={index} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {field.type === 'multiselect' && (
              <div className="border rounded-lg p-3 space-y-2">
                {field.options?.slice(0, 3).map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox />
                    <label className="text-sm">{option}</label>
                  </div>
                ))}
                {field.options && field.options.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    ...and {field.options.length - 3} more options
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function CustomFieldsPage() {
  const router = useRouter()
  const [fields, setFields] = useState<CustomFieldDefinition[]>([])
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set())
  const [editingField, setEditingField] = useState<CustomFieldDefinition | undefined>()
  const [showFieldDialog, setShowFieldDialog] = useState(false)
  const [previewField, setPreviewField] = useState<CustomFieldDefinition | null>(null)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  useEffect(() => {
    loadFields()
  }, [])

  const loadFields = () => {
    const loadedFields = getCustomFields()
    setFields(loadedFields)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        const newOrder = arrayMove(items, oldIndex, newIndex)

        // Update order in storage
        reorderCustomFields(newOrder.map(f => f.id))

        return newOrder
      })
    }
  }

  const handleEdit = (field: CustomFieldDefinition) => {
    setEditingField(field)
    setShowFieldDialog(true)
  }

  const handleAdd = () => {
    setEditingField(undefined)
    setShowFieldDialog(true)
  }

  const handleDelete = (fieldId: string) => {
    if (confirm('Are you sure you want to delete this field? This action cannot be undone.')) {
      deleteCustomField(fieldId)
      loadFields()
      setSelectedFields(new Set(Array.from(selectedFields).filter(id => id !== fieldId)))
    }
  }

  const handleBulkDelete = () => {
    if (selectedFields.size === 0) return

    if (confirm(`Delete ${selectedFields.size} selected field(s)? This action cannot be undone.`)) {
      selectedFields.forEach(id => deleteCustomField(id))
      loadFields()
      setSelectedFields(new Set())
    }
  }

  const handlePreview = (field: CustomFieldDefinition) => {
    setPreviewField(field)
    setShowPreviewDialog(true)
  }

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFields(new Set(fields.map(f => f.id)))
    } else {
      setSelectedFields(new Set())
    }
  }

  const toggleSelect = (fieldId: string, checked: boolean) => {
    const newSelected = new Set(selectedFields)
    if (checked) {
      newSelected.add(fieldId)
    } else {
      newSelected.delete(fieldId)
    }
    setSelectedFields(newSelected)
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/team')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Team
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Custom Fields</h1>
              <p className="text-muted-foreground">
                Manage custom fields for team member profiles
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedFields.size > 0 && (
              <Button variant="destructive" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedFields.size})
              </Button>
            )}
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Field Definitions</CardTitle>
            <CardDescription>
              Drag fields to reorder. Toggle required status inline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <div className="text-center py-12">
                <Type className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No custom fields yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first custom field to extend team member profiles
                </p>
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Field
                </Button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedFields.size === fields.length && fields.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Field Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Options</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <SortableContext
                      items={fields.map(f => f.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {fields.map((field) => (
                        <SortableRow
                          key={field.id}
                          field={field}
                          isSelected={selectedFields.has(field.id)}
                          onSelect={(checked) => toggleSelect(field.id, checked)}
                          onEdit={() => handleEdit(field)}
                          onDelete={() => handleDelete(field.id)}
                          onPreview={() => handlePreview(field)}
                        />
                      ))}
                    </SortableContext>
                  </TableBody>
                </Table>
              </DndContext>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <FieldFormDialog
          field={editingField}
          open={showFieldDialog}
          onOpenChange={setShowFieldDialog}
          onSave={loadFields}
        />

        <PreviewDialog
          field={previewField}
          open={showPreviewDialog}
          onOpenChange={setShowPreviewDialog}
        />
      </div>
    </MainLayout>
  )
}
