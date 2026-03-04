'use client'

import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import LinkExtension from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import { useEffect, useRef } from 'react'

import { CalloutNode } from '@/lib/tiptap/callout-extension'
import { ToggleNode } from '@/lib/tiptap/toggle-extension'
import { SlashCommands } from '@/lib/tiptap/slash-commands'
import { DragHandle } from '@/lib/tiptap/drag-handle-extension'
import { EditorToolbar } from './editor-toolbar'
import { SlashCommandMenu, SlashCommandMenuRef } from './slash-command-menu'
import { CalloutBlock } from './callout-block'
import { ToggleBlock } from './toggle-block'

import tippy, { Instance as TippyInstance } from 'tippy.js'
import { ReactRenderer } from '@tiptap/react'

interface BlockEditorProps {
  content?: string
  onChange?: (content: string) => void
  editable?: boolean
}

export function BlockEditor({ content, onChange, editable = true }: BlockEditorProps) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { HTMLAttributes: { class: 'code-block' } },
      }),
      Placeholder.configure({
        placeholder: "Type '/' for commands...",
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'editor-link' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'editor-image' },
      }),
      Underline,
      CalloutNode.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CalloutBlock)
        },
      }),
      ToggleNode.extend({
        addNodeView() {
          return ReactNodeViewRenderer(ToggleBlock)
        },
      }),
      SlashCommands.configure({
        suggestion: {
          render: () => {
            let component: ReactRenderer<SlashCommandMenuRef> | null = null
            let popup: TippyInstance[] | null = null

            return {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onStart: (props: any) => {
                component = new ReactRenderer(SlashCommandMenu, {
                  props,
                  editor: props.editor,
                })

                if (!props.clientRect) return

                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                })
              },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onUpdate: (props: any) => {
                component?.updateProps(props)
                if (props.clientRect && popup?.[0]) {
                  popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                  })
                }
              },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onKeyDown: (props: any) => {
                if (props.event.key === 'Escape') {
                  popup?.[0]?.hide()
                  return true
                }
                return component?.ref?.onKeyDown(props) ?? false
              },
              onExit: () => {
                popup?.[0]?.destroy()
                component?.destroy()
              },
            }
          },
        },
      }),
      DragHandle,
    ],
    content: content ? JSON.parse(content) : undefined,
    editable,
    onUpdate: ({ editor }) => {
      const json = JSON.stringify(editor.getJSON())
      onChangeRef.current?.(json)
    },
    editorProps: {
      attributes: {
        class: 'prose-editor focus:outline-none min-h-[200px]',
      },
    },
  })

  // Update content when prop changes externally
  useEffect(() => {
    if (!editor || !content) return
    try {
      const parsed = JSON.parse(content)
      const currentJSON = JSON.stringify(editor.getJSON())
      if (content !== currentJSON) {
        editor.commands.setContent(parsed, { emitUpdate: false })
      }
    } catch {
      // Invalid JSON, ignore
    }
  }, [content, editor])

  return (
    <div className="block-editor relative">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
