import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import { signInWithEmail, signInWithGoogle, signInWithPhone, verifyOtp, signUpWithEmail } from '../../lib/supabase/client'
import { authFormSchema, otpFormSchema } from '../../lib/validations/auth'
import type { AuthFormData, AuthMethod, AuthState, OtpFormData } from '../../types/auth'
import type { Profile } from '../../types/database'

interface AuthData {
  user: any;
  profile?: Profile | null;
  session?: any;
}

type AuthMode = 'login' | 'signup'

export default function AuthForm() {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: false,
    error: null,
    verificationSent: false,
  })
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email')
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      role: 'buyer',
    },
  })

  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: otpErrors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpFormSchema),
  })

  const role = watch('role')

  const onSubmit = async (data: AuthFormData) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      if (authMethod === 'email' && data.email && data.password) {
        if (authMode === 'login') {
          const { data: authData, error } = await signInWithEmail(data.email, data.password)
          if (error) throw new Error(error.message)
          
          const typedAuthData = authData as AuthData
          if (typedAuthData?.profile) {
            router.push(`/${typedAuthData.profile.role}/dashboard`)
          } else {
            router.push('/auth/role')
          }
        } else {
          // Sign up flow
          const { error } = await signUpWithEmail(data.email, data.password, data.role)
          if (error) throw new Error(error.message)
          
          // After successful signup, redirect to role selection
          router.push('/auth/role')
        }
      } else if (authMethod === 'phone' && data.phone) {
        const { error } = await signInWithPhone(data.phone)
        if (error) throw new Error(error.message)
        setAuthState((prev) => ({
          ...prev,
          verificationSent: true,
          phone: data.phone,
        }))
      }
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
      }))
    } finally {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const onOtpSubmit = async (data: OtpFormData) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { error } = await verifyOtp(data.phone, data.token)
      if (error) throw new Error(error.message)
      router.push('/auth/role')
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
      }))
    } finally {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const handleGoogleSignIn = async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { error } = await signInWithGoogle()
      if (error) throw new Error(error.message)
      // Redirect will be handled by the OAuth callback
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
      }))
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  if (authState.verificationSent) {
    return (
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Enter Verification Code</h2>
          <p className="mt-2 text-gray-600">
            We sent a code to {authState.phone}
          </p>
        </div>

        <form onSubmit={handleSubmitOtp(onOtpSubmit)} className="mt-8 space-y-6">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <input
              {...registerOtp('token')}
              type="text"
              className={clsx(
                'mt-1 block w-full rounded-md border px-3 py-2 shadow-sm',
                otpErrors.token ? 'border-red-300' : 'border-gray-300'
              )}
            />
            {otpErrors.token && (
              <p className="mt-1 text-sm text-red-600">{otpErrors.token.message}</p>
            )}
          </div>

          <input type="hidden" {...registerOtp('phone')} value={authState.phone} />

          <button
            type="submit"
            disabled={authState.isLoading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {authState.isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold">
          {authMode === 'login' ? 'Sign In to LastBite' : 'Create an Account'}
        </h2>
        <p className="mt-2 text-gray-600">
          {authMode === 'login'
            ? 'Welcome back! Please sign in to continue.'
            : 'Join LastBite to start reducing food waste'}
        </p>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          type="button"
          onClick={() => setAuthMode('login')}
          className={clsx(
            'rounded-md px-4 py-2',
            authMode === 'login'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700'
          )}
        >
          Log In
        </button>
        <button
          type="button"
          onClick={() => setAuthMode('signup')}
          className={clsx(
            'rounded-md px-4 py-2',
            authMode === 'signup'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700'
          )}
        >
          Sign Up
        </button>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          type="button"
          onClick={() => setAuthMethod('email')}
          className={clsx(
            'rounded-md px-4 py-2',
            authMethod === 'email'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700'
          )}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => setAuthMethod('phone')}
          className={clsx(
            'rounded-md px-4 py-2',
            authMethod === 'phone'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700'
          )}
        >
          Phone
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div className="space-y-4">
          {authMethod === 'email' && (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className={clsx(
                    'mt-1 block w-full rounded-md border px-3 py-2 shadow-sm',
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  )}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  {...register('password')}
                  type="password"
                  className={clsx(
                    'mt-1 block w-full rounded-md border px-3 py-2 shadow-sm',
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  )}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </>
          )}

          {authMethod === 'phone' && (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="+1234567890"
                className={clsx(
                  'mt-1 block w-full rounded-md border px-3 py-2 shadow-sm',
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                )}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
          )}
        </div>

        {authState.error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{authState.error}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            type="submit"
            disabled={authState.isLoading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {authState.isLoading
              ? 'Processing...'
              : authMode === 'login'
              ? (authMethod === 'phone' ? 'Send Code' : 'Sign In')
              : (authMethod === 'phone' ? 'Send Code' : 'Sign Up')}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={authState.isLoading}
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <div className="flex items-center justify-center">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="ml-2">
                {authMode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
              </span>
            </div>
          </button>
        </div>
      </form>
    </div>
  )
} 