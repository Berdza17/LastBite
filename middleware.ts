import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Profile } from './types/database'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getSession()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user's profile if authenticated
  let profile: Profile | null = null
  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    profile = profileData
  }

  const path = request.nextUrl.pathname
  
  // Define route types
  const isAuthRoute = path.startsWith('/auth')
  const isBuyerRoute = path.startsWith('/buyer')
  const isSellerRoute = path.startsWith('/seller')
  const isRoleSelectionRoute = path === '/auth/role'
  const isVerificationRoute = path === '/seller/verification'
  const isPendingRoute = path === '/seller/pending'

  // If user is not logged in
  if (!user) {
    if (!isAuthRoute) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    return response
  }

  // If user is logged in but has no profile
  if (user && !profile && !isRoleSelectionRoute && !isAuthRoute) {
    return NextResponse.redirect(new URL('/auth/role', request.url))
  }

  // If user is logged in and trying to access auth routes
  if (user && isAuthRoute && !isRoleSelectionRoute) {
    if (!profile) {
      return NextResponse.redirect(new URL('/auth/role', request.url))
    }
    return NextResponse.redirect(new URL(`/${profile.role}/dashboard`, request.url))
  }

  // Handle seller-specific routes
  if (profile?.role === 'seller') {
    if (!profile.is_verified && !isVerificationRoute && !isPendingRoute && isSellerRoute) {
      if (!profile.business_name) {
        return NextResponse.redirect(new URL('/seller/verification', request.url))
      }
      return NextResponse.redirect(new URL('/seller/pending', request.url))
    }
  }

  // Prevent buyers from accessing seller routes and vice versa
  if (profile?.role === 'buyer' && isSellerRoute) {
    return NextResponse.redirect(new URL('/buyer/dashboard', request.url))
  }
  if (profile?.role === 'seller' && isBuyerRoute) {
    return NextResponse.redirect(new URL('/seller/dashboard', request.url))
  }

  return response
}

// Update the matcher to include all protected routes
export const config = {
  matcher: [
    '/auth/:path*',
    '/buyer/:path*',
    '/seller/:path*',
    '/dashboard',
  ],
} 