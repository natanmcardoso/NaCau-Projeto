import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const { id } = params

  if (body.action === 'adicionar_valor') {
    const { valor } = body
    if (!valor || Number(valor) <= 0) {
      return NextResponse.json({ error: 'valor deve ser positivo' }, { status: 400 })
    }

    // Busca valor_atual atual
    const { data: meta, error: fetchError } = await supabase
      .from('metas')
      .select('valor_atual, valor_total')
      .eq('id', id)
      .single()

    if (fetchError || !meta) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }

    const novoValor = Math.min(
      Number(meta.valor_atual) + Number(valor),
      Number(meta.valor_total)
    )

    const { data, error } = await supabase
      .from('metas')
      .update({ valor_atual: novoValor })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  }

  // Atualização genérica de campos
  const { nome, valor_total, valor_atual, data_fim, ativo } = body
  const update: Record<string, unknown> = {}
  if (nome !== undefined) update.nome = nome
  if (valor_total !== undefined) update.valor_total = Number(valor_total)
  if (valor_atual !== undefined) update.valor_atual = Number(valor_atual)
  if (data_fim !== undefined) update.data_fim = data_fim
  if (ativo !== undefined) update.ativo = ativo

  const { data, error } = await supabase
    .from('metas')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await supabase
    .from('metas')
    .update({ ativo: false })
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
