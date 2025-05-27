import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    await supabase.auth.exchangeCodeForSession(code)

    // After exchanging code for session, check if user has a profile
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Check if user already has a profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (existingProfile) {
        // If user has a profile, redirect to their dashboard
        return NextResponse.redirect(new URL(`/${existingProfile.role}/dashboard`, requestUrl.origin))
      }

      // If no profile exists, create one using the metadata from signup
      const userData = user.user_metadata
      if (userData?.role) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: user.id,
              role: userData.role,
              is_verified: userData.is_verified || false,
            },
          ])
          .single()

        if (!profileError) {
          // If profile creation successful, redirect to appropriate dashboard
          return NextResponse.redirect(
            new URL(
              `/${userData.role}/dashboard`,
              requestUrl.origin
            )
          )
        }
      }

      // If something went wrong with profile creation or no role in metadata,
      // redirect to role selection
      return NextResponse.redirect(new URL('/auth/role', requestUrl.origin))
    }
  }

  // If something goes wrong, redirect to login
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
} 