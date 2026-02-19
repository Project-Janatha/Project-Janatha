import type { AuthStatus, User } from './types'

export type SessionState = {
  authStatus: AuthStatus
  user: User | null
}

export type SessionEvent =
  | { type: 'BOOTSTRAP_START' }
  | { type: 'BOOTSTRAP_SUCCESS'; user: User }
  | { type: 'BOOTSTRAP_FAIL' }
  | { type: 'LOGIN_SUCCESS'; user: User }
  | { type: 'LOGOUT' }
  | { type: 'SESSION_EXPIRED' }
  | { type: 'PROFILE_UPDATED'; user: User }

export const initialSessionState: SessionState = {
  authStatus: 'booting',
  user: null,
}

export function sessionReducer(state: SessionState, event: SessionEvent): SessionState {
  switch (event.type) {
    case 'BOOTSTRAP_START':
      return { ...state, authStatus: 'booting', user: null }
    case 'BOOTSTRAP_SUCCESS':
      return { authStatus: 'authenticated', user: event.user }
    case 'BOOTSTRAP_FAIL':
      return { authStatus: 'unauthenticated', user: null }
    case 'LOGIN_SUCCESS':
      return { authStatus: 'authenticated', user: event.user }
    case 'LOGOUT':
    case 'SESSION_EXPIRED':
      return { authStatus: 'unauthenticated', user: null }
    case 'PROFILE_UPDATED':
      return { ...state, user: event.user }
    default:
      return state
  }
}
