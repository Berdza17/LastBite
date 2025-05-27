'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '../../lib/supabase/client'

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-green-600">LastBite</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      {children}
    </div>
  )
} 