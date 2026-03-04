import { DocumentLink } from '@/types'
import { getAllDocuments, createDocument } from '@/lib/document-storage'
import { toast } from 'sonner'

const DOCUMENT_LINKS_KEY = 'document_links'

export function getAllDocumentLinks(): DocumentLink[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(DOCUMENT_LINKS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveDocumentLinks(links: DocumentLink[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DOCUMENT_LINKS_KEY, JSON.stringify(links))
  } catch {
    toast.error('Failed to save document links')
  }
}

export function getDocumentLinksForTicket(ticketId: number): DocumentLink[] {
  return getAllDocumentLinks().filter(l => l.ticket_id === ticketId)
}

export function linkDocumentToTicket(ticketId: number, documentId: number): DocumentLink {
  const links = getAllDocumentLinks()
  // Prevent duplicates
  const existing = links.find(l => l.ticket_id === ticketId && l.document_id === documentId)
  if (existing) return existing

  const newLink: DocumentLink = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    ticket_id: ticketId,
    document_id: documentId,
    created_date: new Date().toISOString(),
  }
  links.push(newLink)
  saveDocumentLinks(links)
  window.dispatchEvent(new Event('document-links-changed'))
  return newLink
}

export function unlinkDocumentFromTicket(linkId: number): void {
  const links = getAllDocumentLinks().filter(l => l.id !== linkId)
  saveDocumentLinks(links)
  window.dispatchEvent(new Event('document-links-changed'))
}

export function seedDummyDocumentLinks(): void {
  if (typeof window === 'undefined') return

  // Only seed once
  const existing = getAllDocumentLinks()
  if (existing.length > 0) return

  const docs = getAllDocuments()

  // Create sample documents if fewer than 3 exist
  const sampleDocs = [
    { title: 'API Design Spec', icon: '📐', parent_id: null as number | null },
    { title: 'QA Test Plan', icon: '🧪', parent_id: null as number | null },
    { title: 'Release Notes', icon: '📋', parent_id: null as number | null },
  ]

  const docIds: number[] = []

  if (docs.length >= 3) {
    // Use existing documents
    docIds.push(docs[0].id, docs[1].id, docs[2].id)
  } else {
    // Create the sample documents
    for (const sample of sampleDocs) {
      const doc = createDocument(sample)
      docIds.push(doc.id)
    }
  }

  // Check that tickets 1-3 exist
  const tickets = JSON.parse(localStorage.getItem('tickets') || '[]')
  const ticketIds = tickets.slice(0, 3).map((t: { id: number }) => t.id)

  // Link documents to tickets
  if (ticketIds.length > 0 && docIds.length > 0) {
    linkDocumentToTicket(ticketIds[0], docIds[0])
    if (ticketIds.length > 1 && docIds.length > 1) {
      linkDocumentToTicket(ticketIds[1], docIds[1])
      linkDocumentToTicket(ticketIds[0], docIds[1]) // ticket 1 gets 2 docs
    }
    if (ticketIds.length > 2 && docIds.length > 2) {
      linkDocumentToTicket(ticketIds[2], docIds[2])
    }
  }
}
