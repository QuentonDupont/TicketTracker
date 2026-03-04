import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    toggle: {
      setToggle: (attrs?: { summary?: string }) => ReturnType
    }
  }
}

export const ToggleNode = Node.create({
  name: 'toggle',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      summary: { default: 'Toggle heading' },
      open: { default: true },
    }
  },

  parseHTML() {
    return [{ tag: 'details[data-toggle]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'details',
      mergeAttributes(HTMLAttributes, {
        'data-toggle': '',
        class: 'toggle-block',
        open: HTMLAttributes.open ? 'true' : null,
      }),
      ['summary', {}, HTMLAttributes.summary || 'Toggle heading'],
      ['div', { class: 'toggle-content' }, 0],
    ]
  },

  addCommands() {
    return {
      setToggle:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { summary: attrs?.summary || 'Toggle heading', open: true },
            content: [{ type: 'paragraph' }],
          })
        },
    }
  },
})
