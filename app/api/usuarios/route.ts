import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/usuarios — retorna os dois usuários
export async function GET() {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('tipo')

  if (error) {
    return NextResponse.json({ erro: 'Erro ao buscar usuários.' }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/usuarios — cria ou atualiza os dois usuários
export async function POST(request: NextRequest) {
  const { usuario1, usuario2 } = await request.json()

  if (!usuario1?.nome || !usuario1?.telefone || !usuario2?.nome || !usuario2?.telefone) {
    return NextResponse.json({ erro: 'Dados incompletos dos usuários.' }, { status: 400 })
  }

  // Verifica se já existem usuários cadastrados
  const { data: existentes } = await supabase
    .from('usuarios')
    .select('id, tipo')

  const u1Existente = existentes?.find((u) => u.tipo === 'usuario1')
  const u2Existente = existentes?.find((u) => u.tipo === 'usuario2')

  if (u1Existente) {
    await supabase
      .from('usuarios')
      .update({ nome: usuario1.nome, telefone: usuario1.telefone })
      .eq('id', u1Existente.id)
  } else {
    await supabase
      .from('usuarios')
      .insert({ nome: usuario1.nome, telefone: usuario1.telefone, tipo: 'usuario1' })
  }

  if (u2Existente) {
    await supabase
      .from('usuarios')
      .update({ nome: usuario2.nome, telefone: usuario2.telefone })
      .eq('id', u2Existente.id)
  } else {
    await supabase
      .from('usuarios')
      .insert({ nome: usuario2.nome, telefone: usuario2.telefone, tipo: 'usuario2' })
  }

  return NextResponse.json({ ok: true })
}
