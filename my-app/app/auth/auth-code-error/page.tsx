'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'Authentication failed'
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Redirect to home page after 5 seconds
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 text-white">
      <div className="max-w-md w-full p-8 bg-neutral-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Authentication Error</h1>
        
        <div className="bg-red-900/30 border border-red-800 rounded-md p-4 mb-6">
          <p className="text-red-300">{error}</p>
        </div>

        <p className="mb-4 text-gray-300">
          There was a problem with your sign-in attempt. This could be due to:
        </p>
        
        <ul className="list-disc list-inside mb-6 text-gray-300 space-y-1">
          <li>An expired or invalid authentication token</li>
          <li>You denied permission to the application</li>
          <li>A temporary issue with the authentication service</li>
        </ul>

        <div className="flex flex-col space-y-4">
          <Link href="/" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-center transition-colors">
            Return to Home
          </Link>
          
          <p className="text-sm text-center text-gray-400">
            Redirecting to home page in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  )
} 