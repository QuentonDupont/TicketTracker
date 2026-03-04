"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Plus,
  X,
  ExternalLink,
} from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from 'date-fns'
import { DocumentLink, Document } from "@/types"
import {
  getDocumentLinksForTicket,
  linkDocumentToTicket,
  unlinkDocumentFromTicket,
} from "@/lib/document-links"
import { getAllDocuments, getDocumentById } from "@/lib/document-storage"

interface LinkedDocumentsCardProps {
  ticketId: number
}

export function LinkedDocumentsCard({ ticketId }: LinkedDocumentsCardProps) {
  const [links, setLinks] = useState<DocumentLink[]>([])
  const [linkedDocs, setLinkedDocs] = useState<Record<number, Document | null>>({})
  const [allDocs, setAllDocs] = useState<Document[]>([])
  const [showPicker, setShowPicker] = useState(false)

  const loadLinks = () => {
    const docLinks = getDocumentLinksForTicket(ticketId)
    setLinks(docLinks)

    const docsMap: Record<number, Document | null> = {}
    docLinks.forEach((link) => {
      docsMap[link.document_id] = getDocumentById(link.document_id)
    })
    setLinkedDocs(docsMap)
    setAllDocs(getAllDocuments())
  }

  useEffect(() => {
    loadLinks()

    const handleChange = () => loadLinks()
    window.addEventListener('document-links-changed', handleChange)
    window.addEventListener('documents-changed', handleChange)
    return () => {
      window.removeEventListener('document-links-changed', handleChange)
      window.removeEventListener('documents-changed', handleChange)
    }
  }, [ticketId])

  const handleRemoveLink = (linkId: number) => {
    unlinkDocumentFromTicket(linkId)
    toast.success('Document unlinked')
    loadLinks()
  }

  const handleAddLink = (documentId: string) => {
    if (documentId === '__none__') return
    linkDocumentToTicket(ticketId, Number(documentId))
    toast.success('Document linked')
    setShowPicker(false)
    loadLinks()
  }

  // Documents not already linked
  const linkedDocIds = new Set(links.map(l => l.document_id))
  const availableDocs = allDocs.filter(d => !linkedDocIds.has(d.id))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Linked Documents</CardTitle>
            <CardDescription className="text-xs">
              Related documentation
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { setShowPicker(!showPicker); setAllDocs(getAllDocuments()) }}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showPicker && (
          <div className="mb-3">
            <Select onValueChange={handleAddLink}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select a document..." />
              </SelectTrigger>
              <SelectContent>
                {availableDocs.length === 0 ? (
                  <SelectItem value="__none__" disabled>No documents available</SelectItem>
                ) : (
                  availableDocs.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id.toString()}>
                      <span className="flex items-center gap-2">
                        <span>{doc.icon}</span>
                        <span>{doc.title}</span>
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {links.length === 0 ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No linked documents
          </div>
        ) : (
          <div className="space-y-2">
            {links.map((link) => {
              const doc = linkedDocs[link.document_id]

              if (!doc) {
                return (
                  <div
                    key={link.id}
                    className="text-sm text-muted-foreground italic"
                  >
                    Document #{link.document_id} (not found)
                  </div>
                )
              }

              return (
                <div
                  key={link.id}
                  className="group flex items-start gap-2 rounded-md border p-2 hover:bg-accent transition-colors"
                >
                  <span className="text-lg shrink-0 mt-0.5">{doc.icon}</span>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/documents/${doc.id}`}
                      className="flex items-center gap-1.5 text-sm font-medium hover:underline"
                    >
                      <span className="truncate">{doc.title}</span>
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Updated {formatDistanceToNow(new Date(doc.updated_date), { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveLink(link.id)}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
