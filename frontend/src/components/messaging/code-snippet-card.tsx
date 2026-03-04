'use client'

import { useState } from 'react'
import { Copy, Download, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MessageAttachment } from '@/types'

// Language metadata: Tailwind border/badge color + download extension
const LANGUAGE_META: Record<string, { borderClass: string; badgeClass: string; ext: string; label: string }> = {
  typescript: { borderClass: 'border-l-blue-500',    badgeClass: 'bg-blue-500/20 text-blue-400',    ext: '.ts',   label: 'TypeScript' },
  javascript: { borderClass: 'border-l-amber-500',   badgeClass: 'bg-amber-500/20 text-amber-400',  ext: '.js',   label: 'JavaScript' },
  python:     { borderClass: 'border-l-yellow-400',  badgeClass: 'bg-yellow-400/20 text-yellow-300',ext: '.py',   label: 'Python'     },
  sql:        { borderClass: 'border-l-emerald-500', badgeClass: 'bg-emerald-500/20 text-emerald-400',ext: '.sql', label: 'SQL'        },
  bash:       { borderClass: 'border-l-gray-400',    badgeClass: 'bg-gray-400/20 text-gray-300',    ext: '.sh',   label: 'Bash'       },
  shell:      { borderClass: 'border-l-gray-400',    badgeClass: 'bg-gray-400/20 text-gray-300',    ext: '.sh',   label: 'Shell'      },
  json:       { borderClass: 'border-l-cyan-400',    badgeClass: 'bg-cyan-400/20 text-cyan-300',    ext: '.json', label: 'JSON'       },
  html:       { borderClass: 'border-l-orange-500',  badgeClass: 'bg-orange-500/20 text-orange-400',ext: '.html', label: 'HTML'       },
  css:        { borderClass: 'border-l-pink-500',    badgeClass: 'bg-pink-500/20 text-pink-400',    ext: '.css',  label: 'CSS'        },
  java:       { borderClass: 'border-l-red-500',     badgeClass: 'bg-red-500/20 text-red-400',      ext: '.java', label: 'Java'       },
  go:         { borderClass: 'border-l-blue-400',    badgeClass: 'bg-blue-400/20 text-blue-300',    ext: '.go',   label: 'Go'         },
  rust:       { borderClass: 'border-l-orange-400',  badgeClass: 'bg-orange-400/20 text-orange-300',ext: '.rs',   label: 'Rust'       },
}

const DEFAULT_META = { borderClass: 'border-l-violet-500', badgeClass: 'bg-violet-500/20 text-violet-400', ext: '.txt', label: 'Code' }

function getLanguageMeta(language?: string) {
  if (!language) return DEFAULT_META
  return LANGUAGE_META[language.toLowerCase()] ?? DEFAULT_META
}

interface CodeSnippetCardProps {
  attachment: MessageAttachment
}

export function CodeSnippetCard({ attachment }: CodeSnippetCardProps) {
  const [copied, setCopied] = useState(false)
  const code = attachment.code ?? ''
  const meta = getLanguageMeta(attachment.language)
  const lines = code.split('\n')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // fallback — silently ignore
    }
  }

  const handleDownload = () => {
    const filename = attachment.filename
      ? attachment.filename
      : `snippet${meta.ext}`
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      className={[
        'rounded-lg border border-white/10 border-l-4 bg-black/60',
        meta.borderClass,
        'overflow-hidden',
      ].join(' ')}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-white/5">
        {/* Language badge */}
        <span className={['text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full', meta.badgeClass].join(' ')}>
          {meta.label}
        </span>

        {/* Filename (centered, grows) */}
        {attachment.filename && (
          <span className="flex-1 text-center font-mono text-xs text-muted-foreground truncate px-2">
            {attachment.filename}
          </span>
        )}
        {!attachment.filename && <span className="flex-1" />}

        {/* Action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
            title="Copy code"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={handleDownload}
            title="Download file"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Code body */}
      <div className="overflow-x-auto overflow-y-auto max-h-[280px]">
        <pre className="font-mono text-sm leading-relaxed text-foreground/90 m-0 p-0">
          <code>
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-white/5">
                    <td
                      className="select-none text-right pr-3 border-r border-white/10 text-muted-foreground min-w-[2.5rem] py-px px-2 align-top"
                      style={{ userSelect: 'none', fontSize: '0.75rem', lineHeight: 'inherit' }}
                    >
                      {idx + 1}
                    </td>
                    <td className="pl-4 pr-4 py-px align-top whitespace-pre">
                      {line || '\u00A0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </code>
        </pre>
      </div>

      {/* Copied flash overlay (subtle) */}
      {copied && (
        <div className="px-3 py-1 text-xs text-green-400 bg-green-500/10 border-t border-white/10 text-center">
          Copied!
        </div>
      )}
    </div>
  )
}
