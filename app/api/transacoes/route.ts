import { NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  noStore()
  const { searchParams } = new URL(request.url)
  const usuario_id = searchParams.get('usuario_id')
  const tipo = searchParams.get('tipo')
  const categoria = searchParams.get('categoria')
  const data_inicio = searchParams.get('data_inicio')
  const data_fim = searchParams.get('data_fim')

  let query = supabase
    .from('transacoes')
    .select('*, usuarios(id, nome, tipo)')
    .order('data', { ascending: false })
    .order('created_at', { ascending: false })

  if (usuario_id) query = query.eq('usuario_id', usuario_id)
  if (tipo) query = query.eq('tipo', tipo)
  if (categoria) query = query.eq('categoria', categoria)
  if (data_inicio) query = query.gte('data', data_inicio)
  if (data_fim) query = query.lte('data', data_fim)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { usuario_id, tipo, descricao, valor, categoria, data } = body

  if (!tipo || !descricao || !valor) {
    return NextResponse.json(
      { error: 'Campos obrigatórios: tipo, descricao, valor' },
      { status: 400 }
    )
  }

  const { data: transacao, error } = await supabase
    .from('transacoes')
    .insert({
      usuario_id: usuario_id || null,
      tipo,
      descricao,
      valor: Number(valor),
      categoria: categoria || null,
      data: data || new Date().toISOString().split('T')[0],
      origem: 'dashboard',
    })
    .select('*, usuarios(id, nome, tipo)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(transacao, { status: 201 })
}
