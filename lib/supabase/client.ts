import { createBrowserClient } from '@supabase/ssr'
import { type Provider } from '@supabase/supabase-js'
import type { Database, Profile } from '../../types/database'

export type AuthError = {
  message: string
  status?: number
}

const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: { message: error.message, status: error.status } }
    }

    return { data, error: null }
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