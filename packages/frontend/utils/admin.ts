// Shared admin constants and helpers

export const ADMIN_EMAIL = 'chinmayajanata@gmail.com'

export const isLocal =
  typeof window !== 'undefined' && window.location?.hostname === 'localhost'

export function isSuperAdmin(user: { email?: string | null; verificationLevel?: number } | null): boolean {
  if (!user) return false
  return (
    user.email === ADMIN_EMAIL ||
    (user.verificationLevel !== undefined && user.verificationLevel >= 107) ||
    isLocal
  )
}
