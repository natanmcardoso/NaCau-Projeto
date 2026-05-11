import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ROTAS_PUBLICAS = ['/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const autenticado = request.cookies.get('nacau_auth')?.value === 'true'

  // Rota pública: redireciona para home se já autenticado
  if (ROTAS_PUBLICAS.includes(pathname)) {
    if (autenticado) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Rotas de API: sem proteção via middleware (a autenticação é por cookie/session)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Demais rotas: exige autenticação
  if (!autenticado) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
