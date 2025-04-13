'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function ClientAuthHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  
  useEffect(() => {
    // Check for code in URL (from OAuth redirect)
    const code = searchParams.get('code')
    
    if (code) {
      const exchangeCodeForSession = async () => {
        try {
          // Exchange the code for a session
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('Error exchanging code for session:', error)
            router.push(`/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
          } else {
            // Remove the code from URL after successful auth
            const params = new URLSearchParams(window.location.search)
            params.delete('code')
            const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '')
            window.history.replaceState({}, '', newUrl)

            // Refresh the page data
            router.refresh()
          }
        } catch (error) {
          console.error('Error in auth handling:', error)
          router.push('/auth/auth-code-error?error=unexpected')
        }
      }
      
      exchangeCodeForSession()
    }
  }, [searchParams, router, supabase.auth])
  
  // This component doesn't render anything, it just handles authentication
  return null
} 