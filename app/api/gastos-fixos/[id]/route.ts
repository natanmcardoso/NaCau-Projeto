import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// PUT /api/gastos-fixos/[id] — atualiza gasto fixo
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('gastos_fixos')
    .update({
      descricao: body.descricao,
      valor: Number(body.valor),
      categoria: body.categoria,
      dia_vencimento: body.dia_vencimento ?? 10,
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ erro: 'Erro ao atualizar gasto fixo.' }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE /api/gastos-fixos/[id] — desativa gasto fixo (soft delete)
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await supabase
    .from('gastos_fixos')
    .update({ ativo: false })
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ erro: 'Erro ao remover gasto fixo.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
