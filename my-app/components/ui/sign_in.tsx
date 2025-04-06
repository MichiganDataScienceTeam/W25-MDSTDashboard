'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

const OneTapComponent = () => {
  const supabase = createClient()
  const router = useRouter()
  const containerRef = useRef(null)
  const initialized = useRef(false)

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
      // if (data.session) {
      //   console.log('User already has a session')
      //   router.push('/')
      //   return
      // }

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
              
              // Redirect to protected page
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
      <div ref={containerRef} className="flex justify-center"></div>
    </div>
  )
}

export default OneTapComponent