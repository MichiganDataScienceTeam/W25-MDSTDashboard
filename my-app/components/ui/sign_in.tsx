'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

const OneTapComponent = () => {
  const supabase = createClient()
  const router = useRouter()
  const containerRef = useRef(null)
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
      
      const [nonce, hashedNonce] = await generateNonce()
      
      // Redirect to Supabase OAuth endpoint for Google
      const { data, error } = await supabase.auth.signInWithOAuth({
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

  useEffect(() => {
    // Prevent multiple initializations
    if (initialized.current) return
    initialized.current = true

    const initializeGoogleOneTap = async () => {
      console.log('Initializing Google One Tap')
      
      // Check if there's already an existing session before initializing the one-tap UI
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session', error)
      }
      
      if (data?.session) {
        console.log('User already has a session')
        router.refresh() // Force refresh the route to update the UI
        return
      }

      const [nonce, hashedNonce] = await generateNonce()
      console.log('Nonce generated')

      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: async (response) => {
            try {
              console.log('Google One Tap callback received')
              // Send ID token to Supabase
              const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: response.credential,
                nonce,
              })
              
              if (error) throw error
              console.log('Successfully logged in with Google One Tap')
              
              // Refresh the current route to update UI state
              router.refresh()
              // Then redirect to home
              router.push('/')
            } catch (error) {
              console.error('Error logging in with Google One Tap', error)
            }
          },
          nonce: hashedNonce,
          use_fedcm_for_prompt: true, // For Chrome's third-party cookie deprecation
        })

        // Render a button inside our containerRef
        if (containerRef.current) {
          window.google.accounts.id.renderButton(
            containerRef.current,
            {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              text: 'signin_with',
              shape: 'pill',
              logo_alignment: 'left'
            }
          )
        }

        // Also show the One Tap prompt
        window.google.accounts.id.prompt()
      } else {
        console.error('Google Identity Services not loaded')
      }
    }

    // Load Google Identity Services script if not already loaded
    if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initializeGoogleOneTap
      document.body.appendChild(script)
    } else {
      // Script already loaded, just initialize
      initializeGoogleOneTap()
    }

    return () => {
      // Clean up if needed
      initialized.current = false
    }
  }, [router])

  return (
    <div className="absolute right-0 top-16 mt-2 w-96 bg-neutral-800 shadow-xl rounded-md p-4 z-50">
      <h3 className="text-lg font-medium mb-4">Sign in with Google</h3>
      {/* Google One Tap button rendered here */}
      <div ref={containerRef} className="flex justify-center mb-4"></div>
      
      {/* Fallback regular button */}
      <div className="flex justify-center">
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-4 py-2 w-full bg-white text-gray-800 rounded-md hover:bg-gray-100 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  )
}

export default OneTapComponent