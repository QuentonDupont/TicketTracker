const KEY = 'user_profiles'

export interface UserProfile {
  userId: string
  name: string
  avatar?: string    // base64 data URL
  jobTitle?: string
  role?: string      // UserRole string
  email?: string
}

export function getAllUserProfiles(): UserProfile[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function getUserProfile(userId: string): UserProfile | undefined {
  if (!userId) return undefined
  // Bootstrap from user_data if it matches
  try {
    const userData = localStorage.getItem('user_data')
    if (userData) {
      const u = JSON.parse(userData)
      if (u.id === userId) {
        // Ensure it's also in the registry
        const existing = getAllUserProfiles().find(p => p.userId === userId)
        if (!existing || !existing.avatar && u.avatar) {
          saveUserProfile({ userId: u.id, name: u.name, avatar: u.avatar, jobTitle: u.jobTitle, role: u.role, email: u.email })
        }
        return { userId: u.id, name: u.name, avatar: u.avatar, jobTitle: u.jobTitle, role: u.role, email: u.email }
      }
    }
  } catch { /* ignore */ }

  return getAllUserProfiles().find(p => p.userId === userId)
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return
  try {
    const profiles = getAllUserProfiles()
    const idx = profiles.findIndex(p => p.userId === profile.userId)
    if (idx >= 0) {
      profiles[idx] = { ...profiles[idx], ...profile }
    } else {
      profiles.push(profile)
    }
    localStorage.setItem(KEY, JSON.stringify(profiles))
  } catch { /* ignore */ }
}
