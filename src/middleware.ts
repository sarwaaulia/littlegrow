import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // halaman yang boleh di akses tanpa login
  const isAuthPage = path === '/login' || path === '/register'
  const isPublicPage = path === '/'

  // jika user belum login
  if (!user) {
    if (path.startsWith('/admin') && !isAuthPage) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }

  if (user) {
    try {
      const { data: dbUser, error: roleError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = dbUser?.role;

      if (isAuthPage) {
        const target = role === 'ADMIN' ? '/admin/dashboard' : '/';
        return NextResponse.redirect(new URL(target, request.url));
      }

      if (path === '/' && role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }

      if (path.startsWith('/admin') && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (e) {
       console.error("Role check failed", e);
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}