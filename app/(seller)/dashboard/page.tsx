'use client'

import React, { useEffect, useState } from 'react'
import { getCurrentUser, getProfile } from '../../../lib/supabase/client'
import type { Profile } from '../../../types/database'

export default function SellerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      const { user } = await getCurrentUser()
      if (user) {
        const { data } = await getProfile(user.id)
        setProfile(data)
      }
      setLoading(false)
    }

    loadProfile()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-6 sm:p-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-12 w-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="ml-5">
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome to LastBite, {profile?.business_name || 'Seller'}!
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  List your surplus food items and help reduce food waste.
                </p>
              </div>
            </div>

            {!profile?.is_verified ? (
              <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Verification Required
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Your account is pending verification. You'll be able to list
                        products once your business is verified.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8">
                <div className="border-4 border-dashed border-gray-200 rounded-lg p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    No products listed yet
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Get started by adding your first product listing.
                  </p>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add New Product
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 