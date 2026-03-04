'use client'

import { useState } from 'react'
import {
  Table2,
  FileText,
  Monitor,
  Image,
  Archive,
  File,
  Download,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { MessageAttachment } from '@/types'

interface FileAttachmentCardProps {
  attachment: MessageAttachment // type === 'file' | 'image'
}

type FileCategory = 'excel' | 'csv' | 'pdf' | 'word' | 'ppt' | 'image' | 'zip' | 'other'

function getFileCategory(name?: string, mimeType?: string): FileCategory {
  if (name) {
    const lower = name.toLowerCase()
    if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) return 'excel'
    if (lower.endsWith('.csv')) return 'csv'
    if (lower.endsWith('.pdf')) return 'pdf'
    if (lower.endsWith('.docx') || lower.endsWith('.doc')) return 'word'
    if (lower.endsWith('.pptx') || lower.endsWith('.ppt')) return 'ppt'
    if (
      lower.endsWith('.png') ||
      lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      lower.endsWith('.gif') ||
      lower.endsWith('.webp')
    )
      return 'image'
    if (lower.endsWith('.zip')) return 'zip'
  }
  if (mimeType) {
    const lower = mimeType.toLowerCase()
    if (lower.includes('spreadsheet') || lower.includes('excel')) return 'excel'
    if (lower === 'text/csv') return 'csv'
    if (lower === 'application/pdf') return 'pdf'
    if (lower.includes('word') || lower.includes('document')) return 'word'
    if (lower.includes('presentation') || lower.includes('powerpoint')) return 'ppt'
    if (lower.startsWith('image/')) return 'image'
    if (lower === 'application/zip' || lower === 'application/x-zip-compressed') return 'zip'
  }
  return 'other'
}

interface FileCategoryConfig {
  Icon: React.ElementType
  bgClass: string
  textClass: string
}

function getCategoryConfig(category: FileCategory): FileCategoryConfig {
  switch (category) {
    case 'excel':
      return { Icon: Table2, bgClass: 'bg-emerald-500/15', textClass: 'text-emerald-400' }
    case 'csv':
      return { Icon: Table2, bgClass: 'bg-emerald-500/15', textClass: 'text-emerald-400' }
    case 'pdf':
      return { Icon: FileText, bgClass: 'bg-red-500/15', textClass: 'text-red-400' }
    case 'word':
      return { Icon: FileText, bgClass: 'bg-blue-500/15', textClass: 'text-blue-400' }
    case 'ppt':
      return { Icon: Monitor, bgClass: 'bg-orange-500/15', textClass: 'text-orange-400' }
    case 'image':
      return { Icon: Image, bgClass: 'bg-purple-500/15', textClass: 'text-purple-400' }
    case 'zip':
      return { Icon: Archive, bgClass: 'bg-gray-500/15', textClass: 'text-gray-400' }
    default:
      return { Icon: File, bgClass: 'bg-gray-500/15', textClass: 'text-gray-400' }
  }
}

function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function downloadAttachment(attachment: MessageAttachment) {
  if (!attachment.dataUrl) return
  const link = document.createElement('a')
  link.href = attachment.dataUrl
  link.download = attachment.name ?? 'download'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function getExtensionLabel(name?: string, mimeType?: string): string {
  if (name) {
    const parts = name.split('.')
    if (parts.length > 1) return `.${parts[parts.length - 1].toUpperCase()}`
  }
  if (mimeType) return mimeType
  return ''
}

export function FileAttachmentCard({ attachment }: FileAttachmentCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (attachment.type === 'image') {
    return (
      <>
        <div className="flex flex-col gap-2 max-w-xs">
          <img
            src={attachment.dataUrl}
            alt={attachment.name}
            className="max-h-48 max-w-xs rounded-lg object-cover cursor-pointer"
            onClick={() => setLightboxOpen(true)}
          />
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" title={attachment.name}>
                {attachment.name}
              </p>
              {attachment.size !== undefined && (
                <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => downloadAttachment(attachment)}
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {lightboxOpen && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-white/70 transition-colors"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close lightbox"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={attachment.dataUrl}
              alt={attachment.name}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </>
    )
  }

  // FILE attachment
  const category = getFileCategory(attachment.name, attachment.mimeType)
  const { Icon, bgClass, textClass } = getCategoryConfig(category)
  const extensionLabel = getExtensionLabel(attachment.name, attachment.mimeType)

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors max-w-xs">
      {/* File type icon */}
      <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-lg ${bgClass}`}>
        <Icon className={`h-6 w-6 ${textClass}`} />
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="font-medium text-sm truncate max-w-[150px]">{attachment.name}</p>
          </TooltipTrigger>
          <TooltipContent>{attachment.name}</TooltipContent>
        </Tooltip>
        {attachment.size !== undefined && (
          <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
        )}
        {extensionLabel && (
          <p className="text-xs text-muted-foreground">{extensionLabel}</p>
        )}
      </div>

      {/* Download button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 flex-shrink-0"
        onClick={() => downloadAttachment(attachment)}
        title="Download"
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  )
}
