'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getProfile } from '../../../lib/supabase/client'
import type { Profile } from '../../../types/database'

export default function PendingVerificationPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const { user } = await getCurrentUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: profile, error } = await getProfile(user.id)
        if (error) throw error

        if (!profile) {
          router.push('/auth/role')
          return
        }

        if (profile.is_verified) {
          router.push('/seller/dashboard')
          return
        }

        setProfile(profile)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    }

    checkVerificationStatus()
    // Poll for verification status every 30 seconds
    const interval = setInterval(checkVerificationStatus, 30000)
    return () => clearInterval(interval)
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="animate-bounce mb-8">
          <svg
            className="mx-auto h-12 w-12 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Verification in Progress
        </h2>

        <div className="mt-8 bg-white py-8 px-4 shadow rounded-lg">
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Thank you for submitting your verification details. Our team is
              reviewing your application.
            </p>

            {profile && (
              <div className="text-left border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Submitted Details
                </h3>
                <dl className="mt-2 text-sm text-gray-500">
                  <div className="mt-1">
                    <dt className="font-medium">Business Name</dt>
                    <dd>{profile.business_name}</dd>
                  </div>
                  <div className="mt-1">
                    <dt className="font-medium">Contact Name</dt>
                    <dd>{profile.full_name}</dd>
                  </div>
                  <div className="mt-1">
                    <dt className="font-medium">Phone</dt>
                    <dd>{profile.phone_number}</dd>
                  </div>
                  <div className="mt-1">
                    <dt className="font-medium">Address</dt>
                    <dd>{profile.address}</dd>
                  </div>
                </dl>
              </div>
            )}

            <div className="mt-6">
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      You'll be notified once your account is verified. This
                      usually takes 1-2 business days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 