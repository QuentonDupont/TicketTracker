'use client'

import { useState } from 'react'
import { Code2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CodeSnippetCard } from './code-snippet-card'
import { MessageAttachment } from '@/types'

const LANGUAGE_OPTIONS = [
  { value: 'typescript',  label: 'TypeScript' },
  { value: 'javascript',  label: 'JavaScript' },
  { value: 'python',      label: 'Python'     },
  { value: 'sql',         label: 'SQL'        },
  { value: 'bash',        label: 'Bash'       },
  { value: 'json',        label: 'JSON'       },
  { value: 'html',        label: 'HTML'       },
  { value: 'css',         label: 'CSS'        },
  { value: 'java',        label: 'Java'       },
  { value: 'go',          label: 'Go'         },
  { value: 'rust',        label: 'Rust'       },
  { value: 'other',       label: 'Other'      },
]

interface CodeSnippetModalProps {
  open: boolean
  onClose: () => void
  onAttach: (attachment: Omit<MessageAttachment, 'id'>) => void
}

export function CodeSnippetModal({ open, onClose, onAttach }: CodeSnippetModalProps) {
  const [language, setLanguage] = useState('typescript')
  const [filename, setFilename] = useState('')
  const [code, setCode] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const lineCount = code ? code.split('\n').length : 0

  const handleAttach = () => {
    if (!code.trim()) return
    onAttach({
      type: 'code',
      language,
      code,
      filename: filename.trim() || undefined,
    })
    // Reset local state
    setLanguage('typescript')
    setFilename('')
    setCode('')
    setShowPreview(false)
  }

  const handleClose = () => {
    setLanguage('typescript')
    setFilename('')
    setCode('')
    setShowPreview(false)
    onClose()
  }

  // Preview attachment object (no real id needed for preview rendering)
  const previewAttachment: MessageAttachment = {
    id: 0,
    type: 'code',
    language,
    code,
    filename: filename.trim() || undefined,
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
      <DialogContent className="max-w-[640px] w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-blue-400" />
            Share Code Snippet
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          {/* Language + Filename row */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1 w-[180px]">
              <label className="text-xs text-muted-foreground font-medium">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-muted-foreground font-medium">
                Filename <span className="text-muted-foreground/60">(optional)</span>
              </label>
              <Input
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="e.g. auth.ts"
                className="font-mono text-sm"
              />
            </div>
          </div>

          {/* Code textarea */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground font-medium">Code</label>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste or type your code here..."
              className="font-mono text-sm resize-y"
              style={{ minHeight: '200px' }}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {lineCount} {lineCount === 1 ? 'line' : 'lines'}
              </span>
              <Button
                variant={showPreview ? 'secondary' : 'ghost'}
                size="sm"
                className="text-xs h-6 px-2"
                onClick={() => setShowPreview((p) => !p)}
                type="button"
              >
                {showPreview ? 'Hide Preview' : 'Preview'}
              </Button>
            </div>
          </div>

          {/* Live preview */}
          {showPreview && code && (
            <div className="rounded-md overflow-hidden border border-white/10">
              <CodeSnippetCard attachment={previewAttachment} />
            </div>
          )}
          {showPreview && !code && (
            <div className="text-xs text-muted-foreground text-center py-4 border border-dashed border-white/10 rounded-md">
              Enter some code above to see a preview.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} type="button">
            Cancel
          </Button>
          <Button
            onClick={handleAttach}
            disabled={!code.trim()}
            type="button"
          >
            Attach Snippet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
