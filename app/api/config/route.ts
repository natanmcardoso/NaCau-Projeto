import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/config — retorna todas as configurações
export async function GET() {
  const { data, error } = await supabase
    .from('config')
    .select('*')

  if (error) {
    return NextResponse.json({ erro: 'Erro ao buscar configurações.' }, { status: 500 })
  }

  // Transforma array em objeto { key: value }
  const config: Record<string, string> = {}
  for (const item of data) {
    config[item.key] = item.value
  }

  return NextResponse.json(config)
}

// PUT /api/config — atualiza uma ou mais chaves
export async function PUT(request: NextRequest) {
  const body = await request.json()

  const updates = Object.entries(body).map(([key, value]) => ({
    key,
    value: String(value),
    updated_at: new Date().toISOString(),
  }))

  for (const update of updates) {
    const { error } = await supabase
      .from('config')
      .upsert(update, { onConflict: 'key' })

    if (error) {
      return NextResponse.json({ erro: `Erro ao salvar chave "${update.key}".` }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
