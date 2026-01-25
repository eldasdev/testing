import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Admin routes protection
    if (pathname.startsWith('/admin')) {
      // Allow only ADMIN and SUPER_ADMIN roles
      if (!token || (token.role !== 'ADMIN' && token.role !== 'SUPER_ADMIN')) {
        return NextResponse.redirect(new URL('/', req.url))
      }

      // Super Admin only routes
      const superAdminRoutes = ['/admin/admins', '/admin/activity', '/admin/database']
      const isSuperAdminRoute = superAdminRoutes.some(route => pathname.startsWith(route))
      
      if (isSuperAdminRoute && token.role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
    }

    // Admin API routes protection
    if (pathname.startsWith('/api/admin')) {
      if (!token || (token.role !== 'ADMIN' && token.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Job creation route - only companies, admins, and super admins
    if (pathname === '/jobs/new') {
      if (!token || (token.role !== 'COMPANY' && token.role !== 'ADMIN' && token.role !== 'SUPER_ADMIN')) {
        return NextResponse.redirect(new URL('/jobs', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        const publicRoutes = ['/', '/blog', '/community', '/auth', '/about', '/pricing', '/mentoring']
        const isPublicRoute = publicRoutes.some(route => 
          req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(route + '/')
        )
        
        if (isPublicRoute) {
          return true
        }
        
        // Jobs route requires authentication
        if (req.nextUrl.pathname === '/jobs' || req.nextUrl.pathname.startsWith('/jobs/')) {
          return !!token
        }
        
        // Require authentication for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/resume-builder/:path*',
    '/practice/:path*',
    '/roadmap/:path*',
    '/jobs/:path*',
    '/admin/:path*',
    '/api/applications/:path*',
    '/api/resumes/:path*',
    '/api/practice/:path*',
    '/api/roadmaps/:path*',
    '/api/profile/:path*',
    '/api/jobs/:path*',
    '/api/admin/:path*',
  ],
}
