import { NextRequest, NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  noStore()
  const { searchParams } = new URL(request.url)
  const todos = searchParams.get('todos') === 'true'

  let query = supabase.from('metas').select('*').order('created_at', { ascending: false })

  if (!todos) {
    query = query.eq('ativo', true)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { nome, valor_total, valor_atual, data_fim } = body

  if (!nome || !valor_total || !data_fim) {
    return NextResponse.json(
      { error: 'nome, valor_total e data_fim são obrigatórios' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('metas')
    .insert({
      nome,
      valor_total: Number(valor_total),
      valor_atual: Number(valor_atual ?? 0),
      data_fim,
      ativo: true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
