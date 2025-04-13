import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware simply passes through all requests
// Authentication will be handled by the client side
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

// Only include essential paths in the matcher
export const config = {
  matcher: [
    // Authentication callback path
    '/auth/callback',
    // Exclude static files, images, favicon, public and api routes
    '/((?!_next/static|_next/image|api|favicon.ico|public/).*)',
  ],
} 