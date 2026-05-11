// Para uso em API Routes (server-side)
import { createClient as createBrowserClientRaw } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export const supabase = createBrowserClientRaw(supabaseUrl, supabaseKey)

// Tipos do banco de dados
export type Usuario = {
  id: string
  nome: string
  telefone: string
  tipo: 'usuario1' | 'usuario2'
  created_at: string
}

export type Transacao = {
  id: string
  usuario_id: string | null
  tipo: 'gasto' | 'ganho' | 'gasto_va' | 'salario' | 'gasto_fixo'
  descricao: string
  valor: number
  categoria: string | null
  data: string
  origem: 'whatsapp' | 'dashboard' | null
  created_at: string
  usuarios?: Usuario
}

export type GastoFixo = {
  id: string
  descricao: string
  valor: number
  categoria: string
  dia_vencimento: number
  ativo: boolean
  created_at: string
}

export type Parcelamento = {
  id: string
  usuario_id: string | null
  descricao: string
  valor_total: number
  total_parcelas: number
  parcelas_pagas: number
  valor_parcela: number
  data_inicio: string
  data_fim: string
  dia_vencimento: number
  created_at: string
}

export type Meta = {
  id: string
  nome: string
  valor_total: number
  valor_atual: number
  data_fim: string
  ativo: boolean
  created_at: string
}

export type Config = {
  id: string
  key: string
  value: string
  updated_at: string
}

export const CATEGORIAS = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Lazer',
  'Educação',
  'Assinaturas',
  'Vestuário',
  'Presentes',
  'Outros',
] as const

export type Categoria = (typeof CATEGORIAS)[number]
