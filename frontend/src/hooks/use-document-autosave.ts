'use client'

import { useCallback, useRef, useEffect } from 'react'
import { updateDocument } from '@/lib/document-storage'

export function useDocumentAutosave(documentId: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const save = useCallback((content: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      updateDocument(documentId, { content })
    }, 500)
  }, [documentId])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return { save }
}
