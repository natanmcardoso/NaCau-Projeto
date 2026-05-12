import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    .update({
      usuario_id: usuario_id || null,
      tipo,
      descricao,
      valor: Number(valor),
      categoria: categoria || null,
      data,
    })
    .eq('id', params.id)
    .select('*, usuarios(id, nome, tipo)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(transacao)
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await supabase.from('transacoes').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
