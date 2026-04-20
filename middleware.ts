import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  const subdomain = host.split('.')[0]

  if (subdomain === 'utilitypilot') {
    const url = req.nextUrl.clone()
    if (url.pathname === '/') {
      url.pathname = '/utility-pilot'
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
