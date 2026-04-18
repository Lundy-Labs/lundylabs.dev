import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  const subdomain = host.split('.')[0]

  if (subdomain === 'powerbill') {
    const url = req.nextUrl.clone()
    const original = url.pathname
    url.pathname = original === '/' ? '/power-analyzer' : `/power-analyzer${original}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
