'use client'

import React, { useEffect, useState } from 'react'
import { getCurrentUser, getProfile } from '../../../lib/supabase/client'
import type { Profile } from '../../../types/database'

export default function BuyerDashboard() {
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        <div className="p-6 sm:p-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-12 w-12 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <div className="ml-5">
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome to LastBite, {profile?.full_name || 'Buyer'}!
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Find great deals on quality food items from local businesses.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                No listings available yet
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Check back soon for amazing deals from local restaurants and food businesses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 