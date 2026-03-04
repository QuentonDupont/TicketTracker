'use client'

import { useState, useEffect } from 'react'
import { Trash2, Edit2, Check, X, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'
import { ProjectSpace } from '@/types'
import {
  getProjectSpaces,
  updateProjectSpace,
  deleteProjectSpace,
  getTicketCountForSpace
} from '@/lib/project-storage'
import { toast } from 'sonner'

interface ProjectSpaceManageModalProps {
  open: boolean
  onClose: () => void
  onUpdate?: () => void
}

interface EditingSpace {
  id: number
  name: string
  description: string
  color: string
}

const DEFAULT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b',
  '#10b981', '#06b6d4', '#3b82f6', '#a855f7', '#f97316',
]

export default function ProjectSpaceManageModal({
  open,
  onClose,
  onUpdate
}: ProjectSpaceManageModalProps) {
  const [spaces, setSpaces] = useState<ProjectSpace[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingData, setEditingData] = useState<EditingSpace | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<ProjectSpace | null>(null)

  // Load project spaces
  useEffect(() => {
    if (open) {
      loadSpaces()
    }
  }, [open])

  const loadSpaces = () => {
    const allSpaces = getProjectSpaces()
    setSpaces(allSpaces)
  }

  const startEdit = (space: ProjectSpace) => {
    setEditingId(space.id)
    setEditingData({
      id: space.id,
      name: space.name,
      description: space.description || '',
      color: space.color
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingData(null)
  }

  const saveEdit = () => {
    if (!editingData || !editingData.name.trim()) {
      toast.error('Project name is required')
      return
    }

    if (editingData.name.trim().length < 3) {
      toast.error('Project name must be at least 3 characters')
      return
    }

    const updated = updateProjectSpace(editingData.id, {
      name: editingData.name.trim(),
      description: editingData.description.trim() || undefined,
      color: editingData.color
    })

    if (updated) {
      toast.success(`Project space "${updated.name}" updated successfully!`)
      loadSpaces()
      cancelEdit()
      if (onUpdate) onUpdate()
    } else {
      toast.error('Failed to update project space')
    }
  }

  const handleDelete = (space: ProjectSpace) => {
    // Prevent deletion of default space
    if (space.id === 1) {
      toast.error('Cannot delete the default project space')
      return
    }

    setDeleteConfirm(space)
  }

  const confirmDelete = () => {
    if (!deleteConfirm) return

    const ticketCount = getTicketCountForSpace(deleteConfirm.id)
    const success = deleteProjectSpace(deleteConfirm.id)

    if (success) {
      if (ticketCount > 0) {
        toast.success(
          `Project space "${deleteConfirm.name}" deleted. ${ticketCount} ticket(s) moved to Default Project.`
        )
      } else {
        toast.success(`Project space "${deleteConfirm.name}" deleted successfully!`)
      }
      loadSpaces()
      setDeleteConfirm(null)
      if (onUpdate) onUpdate()
    } else {
      toast.error('Failed to delete project space')
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-hidden glass">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gradient">
              Manage Project Spaces
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Edit or delete existing project spaces
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 overflow-auto">
            {spaces.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No project spaces found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Color</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px]">Tickets</TableHead>
                    <TableHead className="w-[150px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spaces.map((space) => {
                    const isEditing = editingId === space.id
                    const ticketCount = getTicketCountForSpace(space.id)

                    return (
                      <TableRow key={space.id}>
                        {/* Color */}
                        <TableCell>
                          {isEditing ? (
                            <div className="flex gap-1">
                              {DEFAULT_COLORS.slice(0, 5).map((color) => (
                                <button
                                  key={color}
                                  onClick={() => setEditingData({ ...editingData!, color })}
                                  className={`
                                    w-6 h-6 rounded transition-all
                                    ${editingData?.color === color ? 'ring-2 ring-blue-500' : ''}
                                  `}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          ) : (
                            <div
                              className="w-6 h-6 rounded"
                              style={{ backgroundColor: space.color }}
                            />
                          )}
                        </TableCell>

                        {/* Name */}
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editingData?.name || ''}
                              onChange={(e) => setEditingData({ ...editingData!, name: e.target.value })}
                              className="glass border-border"
                            />
                          ) : (
                            <div className="font-medium">{space.name}</div>
                          )}
                        </TableCell>

                        {/* Description */}
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editingData?.description || ''}
                              onChange={(e) => setEditingData({ ...editingData!, description: e.target.value })}
                              placeholder="Optional description..."
                              className="glass border-border"
                            />
                          ) : (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {space.description || '—'}
                            </div>
                          )}
                        </TableCell>

                        {/* Ticket Count */}
                        <TableCell>
                          <Badge variant="secondary">
                            {ticketCount} {ticketCount === 1 ? 'ticket' : 'tickets'}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={saveEdit}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                                className="glass border-border"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEdit(space)}
                                className="glass border-border"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(space)}
                                disabled={space.id === 1}
                                className={`
                                  glass border-border
                                  ${space.id === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500/10 hover:border-red-500'}
                                `}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Note about default space */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border/50 mt-4">
            <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              The Default Project space cannot be deleted. Deleting other spaces will move their tickets to the Default Project.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="glass">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project Space?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"?
              {deleteConfirm && getTicketCountForSpace(deleteConfirm.id) > 0 && (
                <span className="block mt-2 text-yellow-500">
                  ⚠️ This project has {getTicketCountForSpace(deleteConfirm.id)} ticket(s) which will be moved to the Default Project.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
