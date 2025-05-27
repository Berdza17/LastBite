export type AuthMethod = 'email' | 'phone' | 'google'
export type UserRole = 'buyer' | 'seller'

export interface AuthFormData {
  email?: string
  password?: string
  phone?: string
  role: UserRole
}

export interface OtpFormData {
  token: string
  phone: string
}

export interface AuthState {
  isLoading: boolean
  error: string | null
  verificationSent: boolean
  phone?: string
} 