import { Extension } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion'
import { Editor, Range } from '@tiptap/core'

export interface SlashCommandItem {
  title: string
  description: string
  icon: string
  category: string
  command: (editor: Editor, range: Range) => void
}

export const SLASH_COMMAND_ITEMS: SlashCommandItem[] = [
  {
    title: 'Heading 1',
    description: 'Large section heading',
    icon: 'H1',
    category: 'Basic',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
    },
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: 'H2',
    category: 'Basic',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
    },
  },
  {
    title: 'Heading 3',
    description: 'Small section heading',
    icon: 'H3',
    category: 'Basic',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
    },
  },
  {
    title: 'Bulleted List',
    description: 'Create a bulleted list',
    icon: 'list',
    category: 'Lists',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
  },
  {
    title: 'Numbered List',
    description: 'Create a numbered list',
    icon: 'list-ordered',
    category: 'Lists',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    },
  },
  {
    title: 'To-do List',
    description: 'Track tasks with checkboxes',
    icon: 'checkbox',
    category: 'Lists',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run()
    },
  },
  {
    title: 'Code Block',
    description: 'Display code with syntax highlighting',
    icon: 'code',
    category: 'Advanced',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
    },
  },
  {
    title: 'Quote',
    description: 'Capture a quote',
    icon: 'quote',
    category: 'Basic',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run()
    },
  },
  {
    title: 'Callout',
    description: 'Highlight important information',
    icon: 'alert',
    category: 'Advanced',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setCallout({ type: 'info', emoji: '💡' }).run()
    },
  },
  {
    title: 'Divider',
    description: 'Separate content with a line',
    icon: 'separator',
    category: 'Basic',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    },
  },
  {
    title: 'Toggle',
    description: 'Collapsible content section',
    icon: 'chevron',
    category: 'Advanced',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setToggle().run()
    },
  },
  {
    title: 'Image',
    description: 'Embed an image from URL',
    icon: 'image',
    category: 'Media',
    command: (editor, range) => {
      const url = window.prompt('Enter image URL')
      if (url) {
        editor.chain().focus().deleteRange(range).setImage({ src: url }).run()
      }
    },
  },
]

export const slashCommandPluginKey = new PluginKey('slashCommands')

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        pluginKey: slashCommandPluginKey,
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: SlashCommandItem }) => {
          props.command(editor, range)
        },
        items: ({ query }: { query: string }) => {
          return SLASH_COMMAND_ITEMS.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase())
          )
        },
      } as Partial<SuggestionOptions<SlashCommandItem>>,
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})
