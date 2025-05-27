import { createBrowserClient } from '@supabase/ssr'
import { type Provider } from '@supabase/supabase-js'
import type { Database } from '../../types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const createClient = () => {
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  )
}

const supabase = createClient()

export async function signUpWithEmail(email: string, password: string, role: 'buyer' | 'seller') {
  try {
    // Determine the redirect URL based on environment
    const redirectTo = process.env.NEXT_PUBLIC_SITE_URL || location.origin
    
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${redirectTo}/auth/callback`,
        data: {
          role: role,
          is_verified: role === 'buyer'
        }
      },
    })

    if (signUpError) {
      return { error: { message: signUpError.message, status: signUpError.status } }
    }

    return { data: authData, error: null }
  } catch (error) {
    return {
      error: {
        message: 'An unexpected error occurred during sign up.',
        status: 500,
      },
    }
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      return { error: { message: signInError.message, status: signInError.status } }
    }

    // Check if user has a profile
    if (authData.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single()

      if (profileError) {
        return { error: { message: profileError.message, status: profileError.code } }
      }

      return { data: { user: authData.user, profile }, error: null }
    }

    return { data: { user: authData.user, profile: null }, error: null }
  } catch (error) {
    return {
      error: {
        message: 'An unexpected error occurred during sign in.',
        status: 500,
      },
    }
  }
}

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google' as Provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      return { error: { message: error.message, status: error.status } }
    }

    return { data, error: null }
  } catch (error) {
    return {
      error: {
        message: 'An unexpected error occurred during Google sign in.',
        status: 500,
      },
    }
  }
}

export async function signInWithPhone(phone: string) {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        shouldCreateUser: true,
        channel: 'sms',
      },
    })

    if (error) {
      return { error: { message: error.message, status: error.status } }
    }

    return { data, error: null }
  } catch (error) {
    return {
      error: {
        message: 'An unexpected error occurred during phone sign in.',
        status: 500,
      },
    }
  }
}

export async function verifyOtp(phone: string, token: string) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    })

    if (error) {
      return { error: { message: error.message, status: error.status } }
    }

    return { data, error: null }
  } catch (error) {
    return {
      error: {
        message: 'An unexpected error occurred during OTP verification.',
        status: 500,
      },
    }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { error: { message: error.message, status: error.status } }
    }

    return { error: null }
  } catch (error) {
    return {
      error: {
        message: 'An unexpected error occurred during sign out.',
        status: 500,
      },
    }
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      return { user: null, error: { message: error.message, status: error.status } }
    }

    return { user, error: null }
  } catch (error) {
    return {
      user: null,
      error: {
        message: 'An unexpected error occurred while getting user.',
        status: 500,
      },
    }
  }
}

// Helper function to handle authentication state changes
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}

export async function createProfile(profile: Database['public']['tables']['profiles']['Insert']) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profile])
      .select()
      .single()

    if (error) {
      return { error: { message: error.message, status: error.code } }
    }

    return { data, error: null }
  } catch (error) {
    return {
      error: {
        message: 'An unexpected error occurred while creating profile.',
        status: 500,
      },
    }
  }
}

export async function getProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      return { error: { message: error.message, status: error.code } }
    }

    return { data, error: null }
  } catch (error) {
    return {
      error: {
        message: 'An unexpected error occurred while fetching profile.',
        status: 500,
      },
    }
  }
}

export async function updateProfile(
  userId: string,
  updates: Database['public']['tables']['profiles']['Update']
) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { error: { message: error.message, status: error.code } }
    }

    return { data, error: null }
  } catch (error) {
    return {
      error: {
        message: 'An unexpected error occurred while updating profile.',
        status: 500,
      },
    }
  }
}

export { supabase } 