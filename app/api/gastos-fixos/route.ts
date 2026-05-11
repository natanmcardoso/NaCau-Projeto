import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/gastos-fixos — lista todos os gastos fixos ativos
export async function GET() {
  const { data, error } = await supabase
    .from('gastos_fixos')
    .select('*')
    .eq('ativo', true)
    .order('descricao')

  if (error) {
    return NextResponse.json({ erro: 'Erro ao buscar gastos fixos.' }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/gastos-fixos — cria novo gasto fixo
export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body.descricao || !body.valor || !body.categoria) {
    return NextResponse.json({ erro: 'Campos obrigatórios faltando.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('gastos_fixos')
    .insert({
      descricao: body.descricao,
      valor: Number(body.valor),
      categoria: body.categoria,
      dia_vencimento: body.dia_vencimento ?? 10,
      ativo: true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ erro: 'Erro ao criar gasto fixo.' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
