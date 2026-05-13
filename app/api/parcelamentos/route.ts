import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/parcelamentos — lista todos os parcelamentos
export async function GET() {
  const { data, error } = await supabase
    .from('parcelamentos')
    .select('*, usuarios(nome)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ erro: 'Erro ao buscar parcelamentos.' }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/parcelamentos — cria novo parcelamento
export async function POST(request: NextRequest) {
  const body = await request.json()

  const { descricao, valor_total, total_parcelas, data_inicio, dia_vencimento, usuario_id } = body

  if (!descricao || !valor_total || !total_parcelas || !data_inicio) {
    return NextResponse.json({ erro: 'Campos obrigatórios faltando.' }, { status: 400 })
  }

  const totalNum = Number(valor_total)
  const parcelasNum = Number(total_parcelas)

  if (totalNum <= 0 || parcelasNum < 1) {
    return NextResponse.json({ erro: 'Valores inválidos.' }, { status: 400 })
  }

  const valor_parcela = Math.round((totalNum / parcelasNum) * 100) / 100

  // Calcula data_fim: data_inicio + (total_parcelas - 1) meses
  const inicio = new Date(data_inicio + 'T00:00:00')
  const fim = new Date(inicio)
  fim.setMonth(fim.getMonth() + parcelasNum - 1)
  const data_fim = fim.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('parcelamentos')
    .insert({
      usuario_id: usuario_id || null,
      descricao,
      valor_total: totalNum,
      total_parcelas: parcelasNum,
      parcelas_pagas: 0,
      valor_parcela,
      data_inicio,
      data_fim,
      dia_vencimento: dia_vencimento ?? 10,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ erro: 'Erro ao criar parcelamento.' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
