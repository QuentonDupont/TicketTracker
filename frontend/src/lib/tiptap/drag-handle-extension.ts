import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export const DragHandle = Extension.create({
  name: 'dragHandle',

  addProseMirrorPlugins() {
    let dragHandleEl: HTMLDivElement | null = null

    return [
      new Plugin({
        key: new PluginKey('dragHandle'),
        view(editorView) {
          dragHandleEl = document.createElement('div')
          dragHandleEl.className = 'drag-handle'
          dragHandleEl.innerHTML = '⠿'
          dragHandleEl.draggable = true
          dragHandleEl.style.display = 'none'
          editorView.dom.parentElement?.appendChild(dragHandleEl)

          const handleMouseMove = (event: MouseEvent) => {
            if (!dragHandleEl) return
            const pos = editorView.posAtCoords({ left: event.clientX, top: event.clientY })
            if (!pos) {
              dragHandleEl.style.display = 'none'
              return
            }

            const resolved = editorView.state.doc.resolve(pos.pos)
            const topLevelNode = resolved.node(1)
            if (!topLevelNode) {
              dragHandleEl.style.display = 'none'
              return
            }

            const domNode = editorView.nodeDOM(resolved.before(1))
            if (domNode instanceof HTMLElement) {
              const rect = domNode.getBoundingClientRect()
              const editorRect = editorView.dom.getBoundingClientRect()
              dragHandleEl.style.display = 'block'
              dragHandleEl.style.top = `${rect.top - editorRect.top}px`
              dragHandleEl.style.left = '-24px'
            }
          }

          const handleMouseLeave = () => {
            if (dragHandleEl) dragHandleEl.style.display = 'none'
          }

          editorView.dom.addEventListener('mousemove', handleMouseMove)
          editorView.dom.addEventListener('mouseleave', handleMouseLeave)

          return {
            destroy() {
              editorView.dom.removeEventListener('mousemove', handleMouseMove)
              editorView.dom.removeEventListener('mouseleave', handleMouseLeave)
              dragHandleEl?.remove()
            },
          }
        },
      }),
    ]
  },
})
