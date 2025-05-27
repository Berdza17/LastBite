'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProfile, getCurrentUser } from '../../../lib/supabase/client'
import type { AuthError } from '../../../lib/supabase/client'

export default function RoleSelectionPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkExistingProfile = async () => {
      const { user } = await getCurrentUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
    }

    checkExistingProfile()
  }, [router])

  const handleRoleSelection = async (role: 'buyer' | 'seller') => {
    setIsLoading(true)
    setError(null)

    try {
      const { user } = await getCurrentUser()
      if (!user) {
        throw new Error('Not authenticated')
      }

      const { error } = await createProfile({
        user_id: user.id,
        role,
        is_verified: role === 'buyer', // Buyers are automatically verified
      })

      if (error) throw error

      // Redirect based on role
      if (role === 'buyer') {
        router.push('/buyer/dashboard')
      } else {
        router.push('/seller/verification') // Sellers need verification
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred while setting role'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Choose your role
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Select how you want to use LastBite
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-8 space-y-4">
          <button
            onClick={() => handleRoleSelection('buyer')}
            disabled={isLoading}
            className="relative w-full flex justify-center py-6 px-4 border-2 border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <div>
              <div className="text-xl font-semibold">Buyer</div>
              <div className="mt-2 text-blue-100">
                Find and purchase discounted food items
              </div>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelection('seller')}
            disabled={isLoading}
            className="relative w-full flex justify-center py-6 px-4 border-2 border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            <div>
              <div className="text-xl font-semibold">Seller</div>
              <div className="mt-2 text-green-100">
                List and sell your surplus food items
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
} 