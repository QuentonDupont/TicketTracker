export type RoleContext = 'engineering' | 'marketing' | 'design' | 'operations' | 'general'

export function getRoleContext(userEmail: string): RoleContext {
  if (typeof window === 'undefined') return 'general'
  try {
    const data = localStorage.getItem('team_members')
    if (!data) return 'general'
    const members = JSON.parse(data)
    const member = members.find((m: any) =>
      m.email?.toLowerCase() === userEmail?.toLowerCase()
    )
    if (!member) return 'general'
    const dept = (member.department || '').toLowerCase()
    const role = (member.role || '').toLowerCase()
    if (dept.includes('engineer') || dept.includes('devops') || dept.includes('qa') ||
        role.includes('developer') || role.includes('engineer') || role.includes('devops')) {
      return 'engineering'
    }
    if (dept.includes('marketing') || dept.includes('sales')) return 'marketing'
    if (dept.includes('design')) return 'design'
    if (dept.includes('operations') || dept.includes('product')) return 'operations'
    return 'general'
  } catch {
    return 'general'
  }
}

export function getToolbarOrder(context: RoleContext): Array<'code' | 'file' | 'emoji' | 'mention'> {
  switch (context) {
    case 'engineering': return ['code', 'file', 'emoji', 'mention']
    case 'marketing':   return ['file', 'emoji', 'code', 'mention']
    case 'design':      return ['file', 'emoji', 'code', 'mention']
    case 'operations':  return ['file', 'emoji', 'mention', 'code']
    default:            return ['emoji', 'file', 'code', 'mention']
  }
}
