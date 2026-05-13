import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// PUT /api/parcelamentos/[id] — marca próxima parcela como paga ou atualiza dados
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()

  // Busca o parcelamento atual para validar
  const { data: atual, error: erroGet } = await supabase
    .from('parcelamentos')
    .select('*')
    .eq('id', params.id)
    .single()

  if (erroGet || !atual) {
    return NextResponse.json({ erro: 'Parcelamento não encontrado.' }, { status: 404 })
  }

  // Se action = 'pagar_parcela', incrementa parcelas_pagas
  if (body.action === 'pagar_parcela') {
    if (atual.parcelas_pagas >= atual.total_parcelas) {
      return NextResponse.json({ erro: 'Todas as parcelas já foram pagas.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('parcelamentos')
      .update({ parcelas_pagas: atual.parcelas_pagas + 1 })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ erro: 'Erro ao atualizar parcela.' }, { status: 500 })
    }

    return NextResponse.json(data)
  }

  // Atualização genérica de campos permitidos
  const campos: Record<string, unknown> = {}
  if (body.descricao !== undefined) campos.descricao = body.descricao
  if (body.parcelas_pagas !== undefined) campos.parcelas_pagas = Number(body.parcelas_pagas)
  if (body.dia_vencimento !== undefined) campos.dia_vencimento = Number(body.dia_vencimento)

  if (Object.keys(campos).length === 0) {
    return NextResponse.json({ erro: 'Nenhum campo para atualizar.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('parcelamentos')
    .update(campos)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ erro: 'Erro ao atualizar parcelamento.' }, { status: 500 })
  }

  return NextResponse.json(data)
}
