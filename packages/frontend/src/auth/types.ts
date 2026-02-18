export type AuthStatus = 'booting' | 'authenticated' | 'unauthenticated'

export interface User {
  username: string
  firstName?: string
  lastName?: string
  email?: string
  centerID?: string
  profileComplete?: boolean
  profileImage?: string
}

export interface AuthError {
  message: string
  code?: string
  status?: number
}

export interface LoginRequest {
  username: string
  password: string
}

export interface SignupRequest {
  username: string
  password: string
}

export interface CheckUserExistsRequest {
  username: string
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  email?: string
  centerID?: string
  profileComplete?: boolean
  profileImage?: string
}

export interface AuthSuccessResponse {
  token?: string
  user: User
}

export interface CheckUserExistsResponse {
  existence: boolean
}

export interface GenericSuccessResponse {
  success: boolean
  message?: string
}

export type AsyncResult<T> = Promise<
  { sucess: true; data: T } | { success: false; error: AuthError }
>
