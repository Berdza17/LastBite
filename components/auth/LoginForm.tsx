'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import Link from 'next/link'
import { signInWithEmail } from '../../lib/supabase/client'
import { loginFormSchema } from '../../lib/validations/auth'
import type { LoginFormData, AuthResponse } from '../../types/auth'

export default function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await signInWithEmail(data.email, data.password)
      if (response.error) throw new Error(response.error.message)
      
      // Redirect based on user's role
      if (response.data?.profile) {
        router.push(`/${response.data.profile.role}/dashboard`)
      } else {
        router.push('/auth/role')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during sign in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Sign In to LastBite</h2>
        <p className="mt-2 text-gray-600">
          Welcome back! Please sign in to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div className="space-y-4">
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
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <div className="text-center text-sm">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-blue-600 hover:text-blue-500">
            Create one
          </Link>
        </div>
      </form>
    </div>
  )
} 