import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (!code) {
      console.error('No code provided in callback')
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`)
    }

    // For security, verify the code is in the right format (but don't actually validate it)
    const codeFormatValid = typeof code === 'string' && code.length > 20
    if (!codeFormatValid) {
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=invalid_code_format`)
    }

    // We'll let the client handle the authentication - just redirect with the code
    // The client will handle the Supabase auth logic
    // This avoids middleware and cookie handling issues
    return NextResponse.redirect(`${origin}/${next}?code=${encodeURIComponent(code)}`)
  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=unexpected`)
  }
} 