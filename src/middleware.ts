import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = req.nextUrl.pathname === '/admin/login'
  const isApiUpload = req.nextUrl.pathname.startsWith('/api/upload')

  if (isLoginPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/admin', req.nextUrl))
    }
    return NextResponse.next()
  }

  if ((isAdminRoute || isApiUpload) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/admin/login', req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/api/upload/:path*']
}
