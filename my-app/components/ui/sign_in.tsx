'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

const OneTapComponent = () => {
  const supabase = createClient()
  const router = useRouter()
  const initialized = useRef(false)
  const [isLoading, setIsLoading] = useState(false)

  // Generate nonce to use for Google ID token sign-in
  const generateNonce = async () => {
    const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))
    const encoder = new TextEncoder()
    const encodedNonce = encoder.encode(nonce)
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    
    return [nonce, hashedNonce]
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      console.log('Manual Google Sign-In triggered')
      
      // Redirect to Supabase OAuth endpoint for Google
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false,
        }
      })
      
      if (error) {
        console.error('OAuth sign-in error:', error)
      }
      
    } catch (error) {
      console.error('Error in handleGoogleSignIn:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Automatically trigger sign-in when component mounts
  useEffect(() => {
    // Only trigger immediately if not already logged in
    const checkSessionAndSignIn = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session', error)
      }
      
      if (data?.session) {
        console.log('User already has a session')
        router.refresh() // Force refresh the route to update the UI
        router.push('/')
      } else {
        // Automatically trigger sign-in
        handleGoogleSignIn()
      }
    }
    
    checkSessionAndSignIn()
    
    return () => {
      initialized.current = false
    }
  }, [router, handleGoogleSignIn, supabase.auth])

  return (
    <div className="absolute right-0 top-16 mt-2 w-96 bg-neutral-800 shadow-xl rounded-md p-4 z-50">
      <h3 className="text-lg font-medium mb-4">Sign in with Google</h3>
      
      <div className="flex flex-col items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
            <p className="text-sm text-gray-300">Redirecting to Google...</p>
          </div>
        ) : (
          <p className="text-sm text-gray-300 text-center">Starting Google sign-in process...</p>
        )}
      </div>
    </div>
  )
}

export default OneTapComponent