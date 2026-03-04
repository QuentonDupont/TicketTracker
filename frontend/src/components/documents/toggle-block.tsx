'use client'

import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react'
import { useState } from 'react'

export function ToggleBlock({ node, updateAttributes }: NodeViewProps) {
  const [isOpen, setIsOpen] = useState(node.attrs.open ?? true)

  const toggle = () => {
    const next = !isOpen
    setIsOpen(next)
    updateAttributes({ open: next })
  }

  return (
    <NodeViewWrapper>
      <div className="toggle-block border border-border rounded-lg my-2 overflow-hidden">
        <button
          className="toggle-summary flex items-center gap-2 w-full px-4 py-2 text-left bg-muted/50 hover:bg-muted transition-colors cursor-pointer border-none"
          contentEditable={false}
          onClick={toggle}
        >
          <span
            className="toggle-chevron transition-transform duration-200 text-muted-foreground"
            style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            ▶
          </span>
          <span className="text-sm font-medium">{node.attrs.summary || 'Toggle heading'}</span>
        </button>
        {isOpen && (
          <div className="toggle-content px-4 py-2">
            <NodeViewContent />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}
