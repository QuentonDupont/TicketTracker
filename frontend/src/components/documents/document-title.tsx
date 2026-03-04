'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { updateDocument } from '@/lib/document-storage'

interface DocumentTitleProps {
  documentId: number
  initialTitle: string
  initialIcon: string
}

export function DocumentTitle({ documentId, initialTitle, initialIcon }: DocumentTitleProps) {
  const [title, setTitle] = useState(initialTitle)
  const [icon, setIcon] = useState(initialIcon)
  const titleRef = useRef<HTMLInputElement>(null)
  const saveTimeout = useRef<NodeJS.Timeout | null>(null)

  const saveTitle = useCallback(
    (newTitle: string) => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
      saveTimeout.current = setTimeout(() => {
        updateDocument(documentId, { title: newTitle || 'Untitled' })
      }, 400)
    },
    [documentId]
  )

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTitle(val)
    saveTitle(val)
  }

  const handleIconClick = () => {
    const icons = ['📄', '📝', '📋', '📌', '📒', '📓', '📕', '📗', '📘', '🗂️', '💡', '🔖', '🎯', '⭐']
    const idx = icons.indexOf(icon)
    const next = icons[(idx + 1) % icons.length]
    setIcon(next)
    updateDocument(documentId, { icon: next })
  }

  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
    }
  }, [])

  return (
    <div className="flex items-center gap-3 mb-6">
      <button
        onClick={handleIconClick}
        className="text-4xl hover:bg-accent rounded-lg p-1 transition-colors cursor-pointer"
        title="Change icon"
        type="button"
      >
        {icon}
      </button>
      <input
        ref={titleRef}
        value={title}
        onChange={handleTitleChange}
        placeholder="Untitled"
        className="text-3xl font-bold bg-transparent border-none outline-none w-full placeholder:text-muted-foreground/40"
      />
    </div>
  )
}
