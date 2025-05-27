'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import Link from 'next/link'
import { signUpWithEmail } from '../../lib/supabase/client'
import { registrationFormSchema } from '../../lib/validations/auth'
import type { RegistrationFormData, AuthResponse } from '../../types/auth'

export default function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      role: 'buyer',
    },
  })

  const role = watch('role')

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await signUpWithEmail(data.email, data.password, data.role)
      if (response.error) throw new Error(response.error.message)
      
      // After successful signup, redirect based on role
      if (data.role === 'buyer') {
        router.push('/buyer/dashboard')
      } else {
        router.push('/seller/verification')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Create an Account</h2>
        <p className="mt-2 text-gray-600">
          Join LastBite to start reducing food waste
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I want to
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={clsx(
                  'relative border rounded-lg p-4 cursor-pointer transition-colors',
                  role === 'buyer'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'
                )}
              >
                <input
                  type="radio"
                  {...register('role')}
                  value="buyer"
                  className="sr-only"
                />
                <div className="text-sm font-medium text-gray-900">Buy Food</div>
                <div className="mt-1 text-xs text-gray-500">
                  Find great deals on quality food
                </div>
              </label>

              <label
                className={clsx(
                  'relative border rounded-lg p-4 cursor-pointer transition-colors',
                  role === 'seller'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'
                )}
              >
                <input
                  type="radio"
                  {...register('role')}
                  value="seller"
                  className="sr-only"
                />
                <div className="text-sm font-medium text-gray-900">Sell Food</div>
                <div className="mt-1 text-xs text-gray-500">
                  List your surplus food items
                </div>
              </label>
            </div>
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
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>

        <div className="text-center text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  )
} 