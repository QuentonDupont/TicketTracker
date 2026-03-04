'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react'

interface MessageSearchBarProps {
  onSearch: (term: string) => void
  onClose: () => void
  matchCount?: number
  currentMatch?: number
  onPrevMatch?: () => void
  onNextMatch?: () => void
}

export function MessageSearchBar({
  onSearch,
  onClose,
  matchCount,
  currentMatch,
  onPrevMatch,
  onNextMatch,
}: MessageSearchBarProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    onSearch(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setValue('')
      onSearch('')
      onClose()
    }
  }

  const handleClose = () => {
    setValue('')
    onSearch('')
    onClose()
  }

  const showMatchCount = value.length > 0 && matchCount !== undefined

  return (
    <div className="animate-in slide-in-from-top-2 duration-200 flex items-center gap-2 px-4 py-2 border-t bg-background">
      <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <Input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Search messages... (Esc to close)"
        className="h-7 text-sm flex-1"
      />
      {showMatchCount && (
        <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
          {matchCount === 0
            ? 'No matches'
            : `${currentMatch ?? 0} / ${matchCount}`}
        </span>
      )}
      {onPrevMatch && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 flex-shrink-0"
          onClick={onPrevMatch}
          disabled={!showMatchCount || matchCount === 0}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      )}
      {onNextMatch && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 flex-shrink-0"
          onClick={onNextMatch}
          disabled={!showMatchCount || matchCount === 0}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 flex-shrink-0"
        onClick={handleClose}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
