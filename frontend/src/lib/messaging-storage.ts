// LocalStorage helper functions for the messaging system
import { Channel, Conversation, Message, MessageAttachment, UserRole, RolePermissions } from '@/types'
import { toast } from 'sonner'
import { getTeamMembers } from '@/lib/team-storage'

const CHANNELS_KEY = 'messaging_channels'
const CONVERSATIONS_KEY = 'messaging_conversations'
const MESSAGES_KEY = 'messaging_messages'
const USER_ROLES_KEY = 'user_roles'
const ROLE_PERMISSIONS_KEY = 'role_permissions'
const READ_STATE_KEY = 'messaging_read_state'
const MESSAGING_SEEDED_KEY = 'messaging_seeded'

// ============================================================================
// DEFAULT PERMISSIONS
// ============================================================================

const DEFAULT_PERMISSIONS: Record<UserRole, RolePermissions> = {
  super_admin: {
    can_create_channels: true,
    can_manage_members: true,
    can_delete_messages: true,
    can_manage_roles: true,
  },
  admin: {
    can_create_channels: true,
    can_manage_members: true,
    can_delete_messages: true,
    can_manage_roles: false,
  },
  member: {
    can_create_channels: false,
    can_manage_members: false,
    can_delete_messages: false,
    can_manage_roles: false,
  },
}

// ============================================================================
// ROLES & PERMISSIONS
// ============================================================================

export function getAllUserRoles(): Record<string, UserRole> {
  if (typeof window === 'undefined') return {}
  try {
    const data = localStorage.getItem(USER_ROLES_KEY)
    if (!data) return {}
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading user roles:', error)
    return {}
  }
}

function saveUserRoles(roles: Record<string, UserRole>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(USER_ROLES_KEY, JSON.stringify(roles))
  } catch (error) {
    console.error('Error saving user roles:', error)
  }
}

export function getUserRole(userId: string): UserRole {
  const roles = getAllUserRoles()
  return roles[userId] || 'member'
}

export function setUserRole(userId: string, role: UserRole): void {
  const roles = getAllUserRoles()
  roles[userId] = role
  saveUserRoles(roles)
}

export function getAllRolePermissions(): Record<UserRole, RolePermissions> {
  if (typeof window === 'undefined') return DEFAULT_PERMISSIONS
  try {
    const data = localStorage.getItem(ROLE_PERMISSIONS_KEY)
    if (!data) return DEFAULT_PERMISSIONS
    return { ...DEFAULT_PERMISSIONS, ...JSON.parse(data) }
  } catch (error) {
    console.error('Error reading role permissions:', error)
    return DEFAULT_PERMISSIONS
  }
}

function saveAllRolePermissions(perms: Record<UserRole, RolePermissions>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ROLE_PERMISSIONS_KEY, JSON.stringify(perms))
  } catch (error) {
    console.error('Error saving role permissions:', error)
  }
}

export function getRolePermissions(role: UserRole): RolePermissions {
  const allPerms = getAllRolePermissions()
  return allPerms[role] || DEFAULT_PERMISSIONS.member
}

export function setRolePermissions(role: UserRole, permissions: RolePermissions): void {
  const allPerms = getAllRolePermissions()
  allPerms[role] = permissions
  saveAllRolePermissions(allPerms)
}

export function hasPermission(userId: string, permission: keyof RolePermissions): boolean {
  const role = getUserRole(userId)
  const perms = getRolePermissions(role)
  return perms[permission]
}

// ============================================================================
// CHANNELS
// ============================================================================

export function getChannels(): Channel[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(CHANNELS_KEY)
    if (!data) return []
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading channels:', error)
    return []
  }
}

function saveChannels(channels: Channel[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CHANNELS_KEY, JSON.stringify(channels))
    window.dispatchEvent(new Event('messaging-changed'))
  } catch (error) {
    console.error('Error saving channels:', error)
    toast.error('Failed to save channels')
  }
}

export function getChannel(id: number): Channel | null {
  return getChannels().find(c => c.id === id) || null
}

export function createChannel(data: Omit<Channel, 'id' | 'created_date'>): Channel {
  const channels = getChannels()
  const newChannel: Channel = {
    ...data,
    id: Date.now(),
    created_date: new Date().toISOString(),
  }
  channels.push(newChannel)
  saveChannels(channels)
  toast.success(`Channel #${newChannel.name} created`)
  return newChannel
}

export function updateChannel(id: number, updates: Partial<Channel>): Channel | null {
  const channels = getChannels()
  const index = channels.findIndex(c => c.id === id)
  if (index === -1) return null
  channels[index] = { ...channels[index], ...updates, id }
  saveChannels(channels)
  return channels[index]
}

export function deleteChannel(id: number): boolean {
  const channels = getChannels()
  const filtered = channels.filter(c => c.id !== id)
  if (filtered.length === channels.length) return false
  saveChannels(filtered)
  // Also delete channel messages
  const messages = getMessages()
  const filteredMessages = messages.filter(m => m.channel_id !== id)
  saveMessages(filteredMessages)
  toast.success('Channel deleted')
  return true
}

export function addChannelMember(channelId: number, userId: string): boolean {
  const channel = getChannel(channelId)
  if (!channel) return false
  if (channel.member_ids.includes(userId)) return true
  return updateChannel(channelId, { member_ids: [...channel.member_ids, userId] }) !== null
}

export function removeChannelMember(channelId: number, userId: string): boolean {
  const channel = getChannel(channelId)
  if (!channel) return false
  return updateChannel(channelId, { member_ids: channel.member_ids.filter(id => id !== userId) }) !== null
}

// ============================================================================
// CONVERSATIONS (DMs & Group DMs)
// ============================================================================

export function getConversations(): Conversation[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(CONVERSATIONS_KEY)
    if (!data) return []
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading conversations:', error)
    return []
  }
}

function saveConversations(conversations: Conversation[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations))
    window.dispatchEvent(new Event('messaging-changed'))
  } catch (error) {
    console.error('Error saving conversations:', error)
    toast.error('Failed to save conversations')
  }
}

export function getUserConversations(userId: string): Conversation[] {
  return getConversations().filter(c => c.participant_ids.includes(userId))
}

export function getConversation(id: number): Conversation | null {
  return getConversations().find(c => c.id === id) || null
}

export function createConversation(participantIds: string[], name?: string): Conversation {
  const type = participantIds.length > 2 ? 'group_dm' : 'dm'
  const conversations = getConversations()
  const newConv: Conversation = {
    id: Date.now(),
    type,
    participant_ids: participantIds.sort(),
    name,
    created_date: new Date().toISOString(),
  }
  conversations.push(newConv)
  saveConversations(conversations)
  return newConv
}

export function getOrCreateDM(userId1: string, userId2: string): Conversation {
  const sorted = [userId1, userId2].sort()
  const existing = getConversations().find(
    c => c.type === 'dm' && c.participant_ids.length === 2 &&
      c.participant_ids[0] === sorted[0] && c.participant_ids[1] === sorted[1]
  )
  if (existing) return existing
  return createConversation(sorted)
}

// ============================================================================
// MESSAGES
// ============================================================================

function getMessages(): Message[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(MESSAGES_KEY)
    if (!data) return []
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading messages:', error)
    return []
  }
}

function saveMessages(messages: Message[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
    window.dispatchEvent(new Event('messaging-changed'))
  } catch (error) {
    console.error('Error saving messages:', error)
    toast.error('Failed to save messages')
  }
}

export function getChannelMessages(channelId: number): Message[] {
  return getMessages().filter(m => m.channel_id === channelId).sort(
    (a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime()
  )
}

export function getConversationMessages(conversationId: number): Message[] {
  return getMessages().filter(m => m.conversation_id === conversationId).sort(
    (a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime()
  )
}

export function sendMessage(data: { channel_id?: number; conversation_id?: number; sender_id: string; sender_name: string; content: string; attachments?: MessageAttachment[]; reply_to_id?: number }): Message {
  const messages = getMessages()
  const newMessage: Message = {
    ...data,
    id: Date.now(),
    created_date: new Date().toISOString(),
    is_edited: false,
  }
  messages.push(newMessage)
  saveMessages(messages)

  // Update conversation last_message_date
  if (data.conversation_id) {
    const convs = getConversations()
    const idx = convs.findIndex(c => c.id === data.conversation_id)
    if (idx !== -1) {
      convs[idx].last_message_date = newMessage.created_date
      saveConversations(convs)
    }
  }

  return newMessage
}

export function editMessage(id: number, content: string): Message | null {
  const messages = getMessages()
  const index = messages.findIndex(m => m.id === id)
  if (index === -1) return null
  messages[index] = {
    ...messages[index],
    content,
    is_edited: true,
    edited_date: new Date().toISOString(),
  }
  saveMessages(messages)
  return messages[index]
}

export function deleteMessage(id: number): boolean {
  const messages = getMessages()
  const filtered = messages.filter(m => m.id !== id)
  if (filtered.length === messages.length) return false
  saveMessages(filtered)
  return true
}

export function addReaction(messageId: number, emoji: string, userId: string): void {
  const messages = getMessages()
  const index = messages.findIndex(m => m.id === messageId)
  if (index === -1) return
  const message = messages[index]
  if (!message.reactions) {
    message.reactions = []
  }
  const existingReaction = message.reactions.find(r => r.emoji === emoji)
  if (existingReaction) {
    const userIndex = existingReaction.user_ids.indexOf(userId)
    if (userIndex !== -1) {
      existingReaction.user_ids.splice(userIndex, 1)
    } else {
      existingReaction.user_ids.push(userId)
    }
  } else {
    message.reactions.push({ emoji, user_ids: [userId] })
  }
  message.reactions = message.reactions.filter(r => r.user_ids.length > 0)
  messages[index] = message
  saveMessages(messages)
}

export function getMessageById(messageId: number): Message | undefined {
  return getMessages().find(m => m.id === messageId)
}

// ============================================================================
// UNREAD TRACKING
// ============================================================================

interface ReadState {
  [key: string]: string // "channel_<id>" or "conv_<id>" -> ISO timestamp of last read
}

function getReadState(userId: string): ReadState {
  if (typeof window === 'undefined') return {}
  try {
    const data = localStorage.getItem(`${READ_STATE_KEY}_${userId}`)
    if (!data) return {}
    return JSON.parse(data)
  } catch { return {} }
}

function saveReadState(userId: string, state: ReadState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`${READ_STATE_KEY}_${userId}`, JSON.stringify(state))
  } catch { /* ignore */ }
}

export function markAsRead(userId: string, type: 'channel' | 'conv', id: number): void {
  const state = getReadState(userId)
  state[`${type}_${id}`] = new Date().toISOString()
  saveReadState(userId, state)
}

export function getUnreadCount(userId: string): number {
  const state = getReadState(userId)
  const messages = getMessages()
  let count = 0

  // Check channels user is a member of
  const channels = getChannels().filter(c => c.member_ids.includes(userId))
  for (const channel of channels) {
    const lastRead = state[`channel_${channel.id}`]
    const channelMsgs = messages.filter(m => m.channel_id === channel.id && m.sender_id !== userId)
    if (lastRead) {
      count += channelMsgs.filter(m => new Date(m.created_date) > new Date(lastRead)).length
    } else {
      count += channelMsgs.length
    }
  }

  // Check conversations
  const convs = getUserConversations(userId)
  for (const conv of convs) {
    const lastRead = state[`conv_${conv.id}`]
    const convMsgs = messages.filter(m => m.conversation_id === conv.id && m.sender_id !== userId)
    if (lastRead) {
      count += convMsgs.filter(m => new Date(m.created_date) > new Date(lastRead)).length
    } else {
      count += convMsgs.length
    }
  }

  return count
}

export function hasUnreadInChannel(userId: string, channelId: number): boolean {
  const state = getReadState(userId)
  const lastRead = state[`channel_${channelId}`]
  const messages = getMessages().filter(m => m.channel_id === channelId && m.sender_id !== userId)
  if (!lastRead) return messages.length > 0
  return messages.some(m => new Date(m.created_date) > new Date(lastRead))
}

export function hasUnreadInConversation(userId: string, conversationId: number): boolean {
  const state = getReadState(userId)
  const lastRead = state[`conv_${conversationId}`]
  const messages = getMessages().filter(m => m.conversation_id === conversationId && m.sender_id !== userId)
  if (!lastRead) return messages.length > 0
  return messages.some(m => new Date(m.created_date) > new Date(lastRead))
}

// ============================================================================
// HELPER: Get team member display name by user ID pattern
// ============================================================================

export function getTeamMemberName(userId: string): string {
  // Map known user IDs
  if (userId === 'user_quenton') return 'Quenton Dupont'
  if (userId === 'user_admin') return 'Admin User'

  // Try to match from team members by converting ID to member ID
  const members = getTeamMembers()
  const numericId = parseInt(userId.replace('team_', ''), 10)
  const member = members.find(m => m.id === numericId)
  if (member) return member.name

  return userId
}

export function getTeamMemberId(member: { id: number }): string {
  return `team_${member.id}`
}

// ============================================================================
// SEED DATA
// ============================================================================

export function seedMessagingData(): void {
  if (typeof window === 'undefined') return
  if (localStorage.getItem(MESSAGING_SEEDED_KEY)) return

  // Set roles
  const roles: Record<string, UserRole> = {
    user_quenton: 'super_admin',
    user_admin: 'admin',
  }
  // Team members default to 'member' — no need to set explicitly

  saveUserRoles(roles)
  saveAllRolePermissions(DEFAULT_PERMISSIONS)

  // Load team members for seeding
  const teamMembers = getTeamMembers()
  const allMemberIds = ['user_quenton', 'user_admin', ...teamMembers.map(m => getTeamMemberId(m))]

  // Create channels
  const generalChannel: Channel = {
    id: 1000001,
    name: 'General',
    description: 'Company-wide announcements and discussions',
    is_private: false,
    member_ids: allMemberIds,
    created_by: 'user_quenton',
    created_date: '2026-01-15T10:00:00.000Z',
  }

  const engineeringChannel: Channel = {
    id: 1000002,
    name: 'Engineering',
    description: 'Engineering team discussions, code reviews, and technical topics',
    is_private: false,
    member_ids: ['user_quenton', 'user_admin', ...teamMembers.filter(m => m.department === 'Engineering').map(m => getTeamMemberId(m))],
    created_by: 'user_quenton',
    created_date: '2026-01-15T10:05:00.000Z',
  }

  const channels = [generalChannel, engineeringChannel]
  localStorage.setItem(CHANNELS_KEY, JSON.stringify(channels))

  // Create a sample DM
  const dmConversation: Conversation = {
    id: 2000001,
    type: 'dm',
    participant_ids: ['user_admin', 'user_quenton'].sort(),
    created_date: '2026-02-01T09:00:00.000Z',
    last_message_date: '2026-02-18T14:30:00.000Z',
  }

  // Create a group DM if we have team members
  const conversations: Conversation[] = [dmConversation]
  if (teamMembers.length >= 2) {
    const groupDm: Conversation = {
      id: 2000002,
      type: 'group_dm',
      participant_ids: ['user_quenton', getTeamMemberId(teamMembers[0]), getTeamMemberId(teamMembers[1])].sort(),
      name: 'Project Sync',
      created_date: '2026-02-10T09:00:00.000Z',
      last_message_date: '2026-02-19T11:00:00.000Z',
    }
    conversations.push(groupDm)
  }

  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations))

  // Seed messages
  const aliceName = teamMembers[0]?.name || 'Alice Johnson'
  const bobName = teamMembers[1]?.name || 'Bob Wilson'
  const aliceId = teamMembers[0] ? getTeamMemberId(teamMembers[0]) : 'team_1'
  const bobId = teamMembers[1] ? getTeamMemberId(teamMembers[1]) : 'team_2'

  const messages: Message[] = [
    // General channel messages
    {
      id: 3000001, channel_id: 1000001, sender_id: 'user_quenton', sender_name: 'Quenton Dupont',
      content: 'Welcome to the General channel! This is the place for company-wide announcements and discussions.',
      created_date: '2026-01-15T10:10:00.000Z', is_edited: false,
    },
    {
      id: 3000002, channel_id: 1000001, sender_id: 'user_admin', sender_name: 'Admin User',
      content: 'Thanks for setting this up! Looking forward to using the new messaging system.',
      created_date: '2026-01-15T10:15:00.000Z', is_edited: false,
    },
    {
      id: 3000003, channel_id: 1000001, sender_id: aliceId, sender_name: aliceName,
      content: 'Great to have team messaging! This will make coordination much easier.',
      created_date: '2026-01-15T10:20:00.000Z', is_edited: false,
    },
    {
      id: 3000004, channel_id: 1000001, sender_id: 'user_quenton', sender_name: 'Quenton Dupont',
      content: 'Reminder: Sprint planning meeting tomorrow at 10 AM. Please review the backlog beforehand.',
      created_date: '2026-02-18T09:00:00.000Z', is_edited: false,
    },
    // Engineering channel messages
    {
      id: 3000005, channel_id: 1000002, sender_id: 'user_quenton', sender_name: 'Quenton Dupont',
      content: 'Engineering discussions go here. Feel free to share code snippets, discuss PRs, and ask technical questions.',
      created_date: '2026-01-15T10:30:00.000Z', is_edited: false,
    },
    {
      id: 3000006, channel_id: 1000002, sender_id: bobId, sender_name: bobName,
      content: 'Just pushed the new API endpoints for the messaging feature. Ready for code review when you get a chance.',
      created_date: '2026-02-17T14:00:00.000Z', is_edited: false,
    },
    {
      id: 3000007, channel_id: 1000002, sender_id: aliceId, sender_name: aliceName,
      content: 'I\'ll take a look at the PR this afternoon. Does it include the WebSocket integration?',
      created_date: '2026-02-17T14:15:00.000Z', is_edited: false,
    },
    {
      id: 3000008, channel_id: 1000002, sender_id: bobId, sender_name: bobName,
      content: 'Not yet — that\'s in the next PR. This one covers the REST endpoints and data models.',
      created_date: '2026-02-17T14:20:00.000Z', is_edited: false,
    },
    // DM messages
    {
      id: 3000009, conversation_id: 2000001, sender_id: 'user_admin', sender_name: 'Admin User',
      content: 'Hey Quenton, do you have a moment to discuss the Q1 roadmap?',
      created_date: '2026-02-18T14:00:00.000Z', is_edited: false,
    },
    {
      id: 3000010, conversation_id: 2000001, sender_id: 'user_quenton', sender_name: 'Quenton Dupont',
      content: 'Sure! I was just reviewing the priorities. Let\'s sync up after the standup.',
      created_date: '2026-02-18T14:30:00.000Z', is_edited: false,
    },
  ]

  // Group DM messages
  if (teamMembers.length >= 2) {
    messages.push(
      {
        id: 3000011, conversation_id: 2000002, sender_id: 'user_quenton', sender_name: 'Quenton Dupont',
        content: `Hey ${aliceName.split(' ')[0]} and ${bobName.split(' ')[0]}, let's sync on the project status.`,
        created_date: '2026-02-19T10:00:00.000Z', is_edited: false,
      },
      {
        id: 3000012, conversation_id: 2000002, sender_id: aliceId, sender_name: aliceName,
        content: 'Sounds good! Frontend is on track — should have the UI components ready by Friday.',
        created_date: '2026-02-19T10:30:00.000Z', is_edited: false,
      },
      {
        id: 3000013, conversation_id: 2000002, sender_id: bobId, sender_name: bobName,
        content: 'Backend APIs are deployed to staging. Running integration tests now.',
        created_date: '2026-02-19T11:00:00.000Z', is_edited: false,
      },
    )
  }

  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))

  // Mark everything as read for the current user to avoid initial unread flood
  const readState: ReadState = {}
  readState['channel_1000001'] = '2026-02-18T09:01:00.000Z'
  readState['channel_1000002'] = '2026-02-17T14:21:00.000Z'
  readState['conv_2000001'] = '2026-02-18T14:31:00.000Z'
  if (teamMembers.length >= 2) {
    readState['conv_2000002'] = '2026-02-19T11:01:00.000Z'
  }
  localStorage.setItem(`${READ_STATE_KEY}_user_quenton`, JSON.stringify(readState))

  localStorage.setItem(MESSAGING_SEEDED_KEY, 'true')
}
