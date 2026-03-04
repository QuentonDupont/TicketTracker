'use client'

import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react'

const CALLOUT_TYPES = {
  info: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800' },
  warning: { bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-800' },
  success: { bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800' },
  error: { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800' },
}

export function CalloutBlock({ node, updateAttributes }: NodeViewProps) {
  const type = (node.attrs.type || 'info') as keyof typeof CALLOUT_TYPES
  const emoji = node.attrs.emoji || '💡'
  const styles = CALLOUT_TYPES[type] || CALLOUT_TYPES.info

  return (
    <NodeViewWrapper>
      <div className={`callout-block ${styles.bg} ${styles.border} border rounded-lg p-4 my-2 flex gap-3`}>
        <button
          className="callout-emoji text-xl cursor-pointer select-none shrink-0 bg-transparent border-none p-0"
          contentEditable={false}
          onClick={() => {
            const emojis = ['💡', '⚠️', '✅', '❌', '📌', '🔥', '💬', '📝']
            const currentIdx = emojis.indexOf(emoji)
            const nextEmoji = emojis[(currentIdx + 1) % emojis.length]
            updateAttributes({ emoji: nextEmoji })
          }}
        >
          {emoji}
        </button>
        <NodeViewContent className="callout-content flex-1 min-w-0" />
      </div>
    </NodeViewWrapper>
  )
}
