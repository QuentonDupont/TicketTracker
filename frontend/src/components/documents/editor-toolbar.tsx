'use client'

import { Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import { Bold, Italic, Strikethrough, Code, Underline, Link } from 'lucide-react'

interface EditorToolbarProps {
  editor: Editor | null
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null

  const toggleLink = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
      return
    }
    const url = window.prompt('Enter URL')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const buttons = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), label: 'Bold' },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), label: 'Italic' },
    { icon: Underline, action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline'), label: 'Underline' },
    { icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike'), label: 'Strikethrough' },
    { icon: Code, action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive('code'), label: 'Code' },
    { icon: Link, action: toggleLink, active: editor.isActive('link'), label: 'Link' },
  ]

  return (
    <BubbleMenu
      editor={editor}
      className="editor-toolbar flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-lg"
    >
      {buttons.map(({ icon: Icon, action, active, label }) => (
        <button
          key={label}
          onClick={action}
          className={`p-1.5 rounded-md transition-colors hover:bg-accent ${
            active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`}
          title={label}
          type="button"
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </BubbleMenu>
  )
}
