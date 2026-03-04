'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { DocumentBreadcrumbs } from '@/components/documents/document-breadcrumbs'
import { DocumentTitle } from '@/components/documents/document-title'
import { BlockEditor } from '@/components/documents/block-editor'
import { DocumentCard } from '@/components/documents/document-card'
import { Button } from '@/components/ui/button'
import { Plus, ArrowLeft } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getDocumentById, getChildDocuments, createDocument } from '@/lib/document-storage'
import { useDocumentAutosave } from '@/hooks/use-document-autosave'
import type { Document } from '@/types'

export default function DocumentEditorPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = Number(params.id)
  const [document, setDocument] = useState<Document | null>(null)
  const [children, setChildren] = useState<Document[]>([])
  const [notFound, setNotFound] = useState(false)
  const { save } = useDocumentAutosave(documentId)

  const loadDocument = useCallback(() => {
    const doc = getDocumentById(documentId)
    if (!doc) {
      setNotFound(true)
      return
    }
    setDocument(doc)
    setChildren(getChildDocuments(documentId))
  }, [documentId])

  useEffect(() => {
    loadDocument()

    const handleChange = () => loadDocument()
    window.addEventListener('documents-changed', handleChange)
    return () => window.removeEventListener('documents-changed', handleChange)
  }, [loadDocument])

  const handleAddSubpage = () => {
    const child = createDocument({ title: 'Untitled', parent_id: documentId })
    if (child) router.push(`/documents/${child.id}`)
  }

  if (notFound) {
    return (
      <MainLayout>
        <div className="w-full px-6 lg:px-12 flex flex-col items-center justify-center py-16 text-center">
          <h1 className="text-2xl font-bold mb-2">Document not found</h1>
          <p className="text-muted-foreground mb-4">
            This document may have been deleted.
          </p>
          <Button variant="outline" onClick={() => router.push('/documents')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documents
          </Button>
        </div>
      </MainLayout>
    )
  }

  if (!document) {
    return (
      <MainLayout>
        <div className="w-full px-6 lg:px-12 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-48 bg-muted rounded" />
            <div className="h-10 w-96 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="w-full px-6 lg:px-12">
        <DocumentBreadcrumbs documentId={documentId} />

        <DocumentTitle
          documentId={documentId}
          initialTitle={document.title}
          initialIcon={document.icon}
        />

        <BlockEditor content={document.content} onChange={save} />

        {/* Sub-pages section */}
        <div className="mt-12 border-t border-border pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Sub-pages
            </h2>
            <Button variant="ghost" size="sm" onClick={handleAddSubpage}>
              <Plus className="h-4 w-4 mr-1" />
              Add a sub-page
            </Button>
          </div>
          {children.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {children.map((child) => (
                <DocumentCard key={child.id} document={child} onUpdate={loadDocument} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No sub-pages yet. Click &quot;Add a sub-page&quot; to create one.
            </p>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
