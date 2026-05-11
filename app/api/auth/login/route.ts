import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const { senha } = await request.json()

  if (!senha) {
    return NextResponse.json({ erro: 'Senha é obrigatória.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('config')
    .select('value')
    .eq('key', 'senha')
    .single()

  if (error || !data) {
    return NextResponse.json({ erro: 'Erro ao verificar senha.' }, { status: 500 })
  }

  if (data.value !== senha) {
    return NextResponse.json({ erro: 'Senha incorreta.' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('nacau_auth', 'true', {
    httpOnly: false,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'strict',
  })

  return response
}
