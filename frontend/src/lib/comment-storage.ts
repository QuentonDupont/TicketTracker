import { TicketComment } from '@/types'
import { addActivity } from './activity-storage'

const COMMENTS_KEY = 'ticket_comments'

function getAllComments(): TicketComment[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(COMMENTS_KEY)
    if (!data) return []
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading comments:', error)
    return []
  }
}

function saveComments(comments: TicketComment[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments))
  } catch (error) {
    console.error('Error saving comments:', error)
  }
}

export function getCommentsForTicket(ticketId: number): TicketComment[] {
  return getAllComments()
    .filter(c => c.ticket_id === ticketId)
    .sort((a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime())
}

export function addComment(
  ticketId: number,
  content: string,
  authorName: string,
  authorEmail: string
): TicketComment {
  const comments = getAllComments()
  const now = new Date().toISOString()
  const newComment: TicketComment = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    ticket_id: ticketId,
    author_name: authorName,
    author_email: authorEmail,
    content,
    created_date: now,
    updated_date: now,
    is_edited: false,
  }
  comments.push(newComment)
  saveComments(comments)

  addActivity({
    ticket_id: ticketId,
    type: 'comment_added',
    description: `${authorName} added a comment`,
    user_name: authorName,
  })

  return newComment
}

export function updateComment(commentId: number, newContent: string): TicketComment | null {
  const comments = getAllComments()
  const index = comments.findIndex(c => c.id === commentId)
  if (index === -1) return null

  const updated: TicketComment = {
    ...comments[index],
    content: newContent,
    updated_date: new Date().toISOString(),
    is_edited: true,
  }
  comments[index] = updated
  saveComments(comments)

  addActivity({
    ticket_id: updated.ticket_id,
    type: 'comment_edited',
    description: `${updated.author_name} edited a comment`,
    user_name: updated.author_name,
  })

  return updated
}

export function deleteComment(commentId: number): boolean {
  const comments = getAllComments()
  const comment = comments.find(c => c.id === commentId)
  if (!comment) return false

  const filtered = comments.filter(c => c.id !== commentId)
  saveComments(filtered)

  addActivity({
    ticket_id: comment.ticket_id,
    type: 'comment_deleted',
    description: `${comment.author_name} deleted a comment`,
    user_name: comment.author_name,
  })

  return true
}

export function getCommentCount(ticketId: number): number {
  return getAllComments().filter(c => c.ticket_id === ticketId).length
}
