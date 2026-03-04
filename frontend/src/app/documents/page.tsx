'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { DocumentCard } from '@/components/documents/document-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, FileText, Search } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getAllDocuments, createDocument } from '@/lib/document-storage'
import type { Document } from '@/types'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [search, setSearch] = useState('')
  const router = useRouter()

  const loadDocuments = useCallback(() => {
    const docs = getAllDocuments()
    // Sort by updated_date descending
    docs.sort((a, b) => new Date(b.updated_date).getTime() - new Date(a.updated_date).getTime())
    setDocuments(docs)
  }, [])

  useEffect(() => {
    loadDocuments()

    const handleChange = () => loadDocuments()
    window.addEventListener('documents-changed', handleChange)
    return () => window.removeEventListener('documents-changed', handleChange)
  }, [loadDocuments])

  const handleCreate = () => {
    const doc = createDocument({ title: 'Untitled', parent_id: null })
    if (doc) router.push(`/documents/${doc.id}`)
  }

  const filtered = search
    ? documents.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()))
    : documents

  const rootDocs = filtered.filter((d) => d.parent_id === null)
  const favoriteDocs = filtered.filter((d) => d.is_favorite)

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Documents</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Create and organize your documents
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {favoriteDocs.length > 0 && !search && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Favorites
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {favoriteDocs.map((doc) => (
                <DocumentCard key={doc.id} document={doc} onUpdate={loadDocuments} />
              ))}
            </div>
          </div>
        )}

        <div>
          {!search && (
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              All Documents
            </h2>
          )}
          {rootDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-medium mb-1">No documents yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Create your first document to get started
              </p>
              <Button onClick={handleCreate} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                New Document
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {rootDocs.map((doc) => (
                <DocumentCard key={doc.id} document={doc} onUpdate={loadDocuments} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
