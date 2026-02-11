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
  const url = request.nextUrl.clone()

  // jika belum login dan mencoba akses dashboard
  if (!user && (request.nextUrl.pathname.startsWith('/home') || request.nextUrl.pathname.startsWith('/admin/dashboard'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // jika sudah login tapi mencoba membuka halaman regist/login
  if(user && (url.pathname === '/login' || url.pathname === '/register')) {
    const {data: users} = await supabase.from('users').select('role').eq('id', user.id).single()

    const targetPath = users?.role === 'ADMIN' ? '/admin/dashboard' : '/customer'
    return NextResponse.redirect(new URL(targetPath, request.url))
  }

  // Role-Based Access Control (RBAC)
  if (user) {
    // Ambil role dari tabel public.users
    const { data: users } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdminPath = request.nextUrl.pathname.startsWith('/admin/dashboard')
    const isCustomerPath = request.nextUrl.pathname.startsWith('/customer')

    // Jika customer mencoba masuk ke /admin
    if (isAdminPath && users?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/customer', request.url))
    }

    // Jika admin mencoba masuk ke dashboard customer
    if (isCustomerPath && users?.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/login', '/register'],
}