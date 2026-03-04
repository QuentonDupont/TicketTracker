import { Node, mergeAttributes } from '@tiptap/core'

export type CalloutType = 'info' | 'warning' | 'success' | 'error'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (attrs?: { type?: CalloutType; emoji?: string }) => ReturnType
    }
  }
}

export const CalloutNode = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      emoji: { default: '💡' },
      type: { default: 'info' as CalloutType },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-callout]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-callout': '',
        'data-type': HTMLAttributes.type || 'info',
        class: 'callout-block',
      }),
      ['span', { class: 'callout-emoji', contenteditable: 'false' }, HTMLAttributes.emoji || '💡'],
      ['div', { class: 'callout-content' }, 0],
    ]
  },

  addCommands() {
    return {
      setCallout:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { type: attrs?.type || 'info', emoji: attrs?.emoji || '💡' },
            content: [{ type: 'paragraph' }],
          })
        },
    }
  },
})
