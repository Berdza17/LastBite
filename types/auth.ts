export type UserRole = 'buyer' | 'seller'

export interface LoginFormData {
  email: string
  password: string
}

export interface RegistrationFormData {
  email: string
  password: string
  role: UserRole
}

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

export interface Profile {
  id: string
  user_id: string
  role: UserRole
  is_verified: boolean
  created_at: string
  updated_at: string
  full_name?: string
  business_name?: string
  phone_number?: string
  address?: string
}

export interface AuthResponse {
  data: {
    user: any
    profile: Profile | null
  } | null
  error: {
    message: string
    status: number
  } | null
}

export type AuthMethod = 'email' | 'phone' 