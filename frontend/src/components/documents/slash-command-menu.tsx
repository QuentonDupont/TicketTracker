'use client'

import { forwardRef, useEffect, useImperativeHandle, useState, useCallback } from 'react'
import { SlashCommandItem } from '@/lib/tiptap/slash-commands'

export interface SlashCommandMenuRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

interface SlashCommandMenuProps {
  items: SlashCommandItem[]
  command: (item: SlashCommandItem) => void
}

export const SlashCommandMenu = forwardRef<SlashCommandMenuRef, SlashCommandMenuProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    useEffect(() => {
      setSelectedIndex(0)
    }, [items])

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index]
        if (item) command(item)
      },
      [items, command]
    )

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((prev) => (prev + items.length - 1) % items.length)
          return true
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((prev) => (prev + 1) % items.length)
          return true
        }
        if (event.key === 'Enter') {
          selectItem(selectedIndex)
          return true
        }
        return false
      },
    }))

    if (items.length === 0) {
      return (
        <div className="slash-command-menu">
          <div className="slash-command-empty">No results</div>
        </div>
      )
    }

    // Group items by category
    const grouped: Record<string, SlashCommandItem[]> = {}
    for (const item of items) {
      if (!grouped[item.category]) grouped[item.category] = []
      grouped[item.category].push(item)
    }

    let flatIndex = -1

    return (
      <div className="slash-command-menu">
        {Object.entries(grouped).map(([category, categoryItems]) => (
          <div key={category}>
            <div className="slash-command-category">{category}</div>
            {categoryItems.map((item) => {
              flatIndex++
              const index = flatIndex
              return (
                <button
                  key={item.title}
                  className={`slash-command-item ${index === selectedIndex ? 'is-selected' : ''}`}
                  onClick={() => selectItem(index)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span className="slash-command-icon">{item.icon}</span>
                  <div className="slash-command-text">
                    <span className="slash-command-title">{item.title}</span>
                    <span className="slash-command-description">{item.description}</span>
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    )
  }
)

SlashCommandMenu.displayName = 'SlashCommandMenu'
