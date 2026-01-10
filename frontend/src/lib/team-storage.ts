// LocalStorage helper functions for team members and custom fields
import { TeamMember, CustomFieldDefinition } from '@/types'
import { toast } from 'sonner'

const TEAM_MEMBERS_KEY = 'team_members'
const CUSTOM_FIELDS_KEY = 'team_custom_fields'

// ============================================================================
// TEAM MEMBERS
// ============================================================================

/**
 * Get all team members from localStorage
 */
export function getTeamMembers(): TeamMember[] {
  if (typeof window === 'undefined') return []

  try {
    const data = localStorage.getItem(TEAM_MEMBERS_KEY)
    if (!data) return []
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading team members:', error)
    return []
  }
}

/**
 * Get a single team member by ID
 */
export function getTeamMember(id: number): TeamMember | null {
  const members = getTeamMembers()
  return members.find(m => m.id === id) || null
}

/**
 * Save all team members to localStorage
 */
export function saveTeamMembers(members: TeamMember[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(TEAM_MEMBERS_KEY, JSON.stringify(members))
  } catch (error) {
    console.error('Error saving team members:', error)
    toast.error('Failed to save team members')
  }
}

/**
 * Add a new team member
 */
export function addTeamMember(member: Omit<TeamMember, 'id' | 'createdDate' | 'lastModified'>): TeamMember {
  const members = getTeamMembers()
  const newMember: TeamMember = {
    ...member,
    id: Date.now(),
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString()
  }

  members.push(newMember)
  saveTeamMembers(members)
  toast.success(`${newMember.name} added to team`)

  return newMember
}

/**
 * Update an existing team member
 */
export function updateTeamMember(id: number, updates: Partial<TeamMember>): TeamMember | null {
  const members = getTeamMembers()
  const index = members.findIndex(m => m.id === id)

  if (index === -1) {
    toast.error('Team member not found')
    return null
  }

  const updatedMember: TeamMember = {
    ...members[index],
    ...updates,
    id, // Ensure ID doesn't change
    lastModified: new Date().toISOString()
  }

  members[index] = updatedMember
  saveTeamMembers(members)

  return updatedMember
}

/**
 * Delete a team member
 */
export function deleteTeamMember(id: number): boolean {
  const members = getTeamMembers()
  const filtered = members.filter(m => m.id !== id)

  if (filtered.length === members.length) {
    toast.error('Team member not found')
    return false
  }

  saveTeamMembers(filtered)
  toast.success('Team member removed')
  return true
}

/**
 * Update a single field of a team member (for inline editing)
 */
export function updateTeamMemberField<K extends keyof TeamMember>(
  id: number,
  field: K,
  value: TeamMember[K]
): boolean {
  const member = updateTeamMember(id, { [field]: value })

  if (member) {
    toast.success('Updated successfully')
    return true
  }

  return false
}

// ============================================================================
// CUSTOM FIELDS
// ============================================================================

/**
 * Get all custom field definitions
 */
export function getCustomFields(): CustomFieldDefinition[] {
  if (typeof window === 'undefined') return []

  try {
    const data = localStorage.getItem(CUSTOM_FIELDS_KEY)
    if (!data) return []
    const fields = JSON.parse(data)
    // Sort by order
    return fields.sort((a: CustomFieldDefinition, b: CustomFieldDefinition) => a.order - b.order)
  } catch (error) {
    console.error('Error reading custom fields:', error)
    return []
  }
}

/**
 * Save custom field definitions
 */
export function saveCustomFields(fields: CustomFieldDefinition[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(CUSTOM_FIELDS_KEY, JSON.stringify(fields))
  } catch (error) {
    console.error('Error saving custom fields:', error)
    toast.error('Failed to save custom fields')
  }
}

/**
 * Add a new custom field definition
 */
export function addCustomField(field: Omit<CustomFieldDefinition, 'order'>): CustomFieldDefinition {
  const fields = getCustomFields()
  const maxOrder = fields.length > 0 ? Math.max(...fields.map(f => f.order)) : 0

  const newField: CustomFieldDefinition = {
    ...field,
    order: maxOrder + 1
  }

  fields.push(newField)
  saveCustomFields(fields)
  toast.success(`Custom field "${field.label}" added`)

  return newField
}

/**
 * Update a custom field definition
 */
export function updateCustomField(id: string, updates: Partial<CustomFieldDefinition>): CustomFieldDefinition | null {
  const fields = getCustomFields()
  const index = fields.findIndex(f => f.id === id)

  if (index === -1) {
    toast.error('Custom field not found')
    return null
  }

  const updatedField: CustomFieldDefinition = {
    ...fields[index],
    ...updates,
    id // Ensure ID doesn't change
  }

  fields[index] = updatedField
  saveCustomFields(fields)
  toast.success('Custom field updated')

  return updatedField
}

/**
 * Delete a custom field definition
 */
export function deleteCustomField(id: string): boolean {
  const fields = getCustomFields()
  const filtered = fields.filter(f => f.id !== id)

  if (filtered.length === fields.length) {
    toast.error('Custom field not found')
    return false
  }

  saveCustomFields(filtered)
  toast.success('Custom field deleted')
  return true
}

/**
 * Reorder custom fields
 */
export function reorderCustomFields(fieldIds: string[]): void {
  const fields = getCustomFields()

  const reordered = fieldIds.map((id, index) => {
    const field = fields.find(f => f.id === id)
    if (!field) return null
    return { ...field, order: index }
  }).filter((f): f is CustomFieldDefinition => f !== null)

  saveCustomFields(reordered)
  toast.success('Fields reordered')
}

/**
 * Get custom field value for a team member
 */
export function getCustomFieldValue(memberId: number, fieldId: string): any {
  const member = getTeamMember(memberId)
  return member?.customFieldValues?.[fieldId]
}

/**
 * Set custom field value for a team member
 */
export function setCustomFieldValue(memberId: number, fieldId: string, value: any): boolean {
  const member = getTeamMember(memberId)
  if (!member) {
    toast.error('Team member not found')
    return false
  }

  const customFieldValues = {
    ...(member.customFieldValues || {}),
    [fieldId]: value
  }

  return updateTeamMember(memberId, { customFieldValues }) !== null
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize with default data if localStorage is empty
 */
export function initializeTeamData(): void {
  const members = getTeamMembers()
  if (members.length > 0) return // Already initialized

  // Default team members will be added from the team page component
  console.log('Team storage initialized')
}
