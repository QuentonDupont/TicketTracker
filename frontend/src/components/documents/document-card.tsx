'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { MoreHorizontal, Trash2, Star, StarOff } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import type { Document } from '@/types'
import { updateDocument, deleteDocument } from '@/lib/document-storage'

interface DocumentCardProps {
  document: Document
  onUpdate?: () => void
}

export function DocumentCard({ document, onUpdate }: DocumentCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm('Delete this document and all sub-pages?')) {
      deleteDocument(document.id)
      onUpdate?.()
    }
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateDocument(document.id, { is_favorite: !document.is_favorite })
    onUpdate?.()
  }

  return (
    <Link href={`/documents/${document.id}`}>
      <Card className="hover:shadow-md transition-all hover:border-primary/30 cursor-pointer group h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-2xl shrink-0">{document.icon}</span>
              <h3 className="font-medium truncate">{document.title}</h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleToggleFavorite}>
                  {document.is_favorite ? (
                    <>
                      <StarOff className="h-4 w-4 mr-2" /> Remove favorite
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-2" /> Add to favorites
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Updated {formatDistanceToNow(new Date(document.updated_date), { addSuffix: true })}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
