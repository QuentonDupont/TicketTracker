import { Document, DocumentTreeNode } from '@/types'
import { toast } from 'sonner'

const DOCUMENTS_KEY = 'documents'

export function getAllDocuments(): Document[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(DOCUMENTS_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Failed to load documents:', error)
    return []
  }
}

function saveDocuments(documents: Document[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents))
  } catch (error) {
    console.error('Failed to save documents:', error)
    toast.error('Failed to save documents')
  }
}

export function getDocumentById(id: number): Document | null {
  const docs = getAllDocuments()
  return docs.find(d => d.id === id) || null
}

export function getChildDocuments(parentId: number | null): Document[] {
  const docs = getAllDocuments()
  return docs
    .filter(d => d.parent_id === parentId)
    .sort((a, b) => a.order - b.order)
}

export function createDocument(data: Partial<Omit<Document, 'id' | 'created_date' | 'updated_date'>> & { title: string; parent_id: number | null }): Document {
  const docs = getAllDocuments()
  const now = new Date().toISOString()
  const siblings = docs.filter(d => d.parent_id === data.parent_id)
  const newDoc: Document = {
    icon: data.icon || '📄',
    content: data.content || '',
    order: data.order ?? siblings.length,
    is_favorite: data.is_favorite ?? false,
    cover_image: data.cover_image,
    title: data.title,
    parent_id: data.parent_id,
    id: Date.now() + Math.floor(Math.random() * 1000),
    created_date: now,
    updated_date: now,
  }
  docs.push(newDoc)
  saveDocuments(docs)
  window.dispatchEvent(new Event('documents-changed'))
  return newDoc
}

export function updateDocument(id: number, updates: Partial<Omit<Document, 'id' | 'created_date'>>): Document | null {
  const docs = getAllDocuments()
  const index = docs.findIndex(d => d.id === id)
  if (index === -1) return null
  docs[index] = {
    ...docs[index],
    ...updates,
    updated_date: new Date().toISOString(),
  }
  saveDocuments(docs)
  window.dispatchEvent(new Event('documents-changed'))
  return docs[index]
}

export function getDocumentDescendantIds(id: number): number[] {
  const docs = getAllDocuments()
  const ids: number[] = []
  function collect(parentId: number) {
    for (const doc of docs) {
      if (doc.parent_id === parentId) {
        ids.push(doc.id)
        collect(doc.id)
      }
    }
  }
  collect(id)
  return ids
}

export function deleteDocument(id: number): boolean {
  const docs = getAllDocuments()
  const descendantIds = getDocumentDescendantIds(id)
  const idsToDelete = new Set([id, ...descendantIds])
  const filtered = docs.filter(d => !idsToDelete.has(d.id))
  if (filtered.length === docs.length) return false
  saveDocuments(filtered)
  window.dispatchEvent(new Event('documents-changed'))
  toast.success('Document deleted')
  return true
}

export function getDocumentBreadcrumbs(id: number): Document[] {
  const docs = getAllDocuments()
  const crumbs: Document[] = []
  let current = docs.find(d => d.id === id)
  while (current) {
    crumbs.unshift(current)
    if (current.parent_id === null) break
    current = docs.find(d => d.id === current!.parent_id)
  }
  return crumbs
}

export function buildDocumentTree(): DocumentTreeNode[] {
  const docs = getAllDocuments()
  const byParent = new Map<number | null, Document[]>()

  for (const doc of docs) {
    const key = doc.parent_id
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key)!.push(doc)
  }

  function buildChildren(parentId: number | null): DocumentTreeNode[] {
    const children = byParent.get(parentId) || []
    return children
      .sort((a, b) => a.order - b.order)
      .map(doc => ({
        ...doc,
        children: buildChildren(doc.id),
      }))
  }

  return buildChildren(null)
}

export function moveDocument(id: number, newParentId: number | null, newOrder: number): void {
  const docs = getAllDocuments()
  const index = docs.findIndex(d => d.id === id)
  if (index === -1) return
  docs[index].parent_id = newParentId
  docs[index].order = newOrder
  docs[index].updated_date = new Date().toISOString()

  // Re-number siblings at the new parent
  const siblings = docs
    .filter(d => d.parent_id === newParentId && d.id !== id)
    .sort((a, b) => a.order - b.order)
  let order = 0
  for (const sibling of siblings) {
    if (order === newOrder) order++
    sibling.order = order++
  }

  saveDocuments(docs)
  window.dispatchEvent(new Event('documents-changed'))
}
