'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getDocumentBreadcrumbs } from '@/lib/document-storage'
import type { Document } from '@/types'

interface DocumentBreadcrumbsProps {
  documentId: number
}

export function DocumentBreadcrumbs({ documentId }: DocumentBreadcrumbsProps) {
  const [crumbs, setCrumbs] = useState<Document[]>([])

  useEffect(() => {
    setCrumbs(getDocumentBreadcrumbs(documentId))
  }, [documentId])

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4 flex-wrap">
      <Link href="/documents" className="hover:text-foreground transition-colors">
        Documents
      </Link>
      {crumbs.map((doc) => (
        <span key={doc.id} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5" />
          {doc.id === documentId ? (
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {doc.icon} {doc.title}
            </span>
          ) : (
            <Link
              href={`/documents/${doc.id}`}
              className="hover:text-foreground transition-colors truncate max-w-[200px]"
            >
              {doc.icon} {doc.title}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
