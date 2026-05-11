import { supabase } from './supabase'

const SESSION_KEY = 'nacau_session'
const COOKIE_NAME = 'nacau_auth'

export async function login(senha: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('config')
    .select('value')
    .eq('key', 'senha')
    .single()

  if (error || !data) return false

  const senhaCorreta = data.value === senha

  if (senhaCorreta) {
    // Persiste sessão em localStorage e cookie para SSR
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, 'true')
      document.cookie = `${COOKIE_NAME}=true; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Strict`
    }
  }

  return senhaCorreta
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY)
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(SESSION_KEY) === 'true'
}

export async function alterarSenha(senhaAtual: string, novaSenha: string): Promise<{ ok: boolean; erro?: string }> {
  const { data, error } = await supabase
    .from('config')
    .select('value')
    .eq('key', 'senha')
    .single()

  if (error || !data) return { ok: false, erro: 'Erro ao verificar senha.' }
  if (data.value !== senhaAtual) return { ok: false, erro: 'Senha atual incorreta.' }

  const { error: updateError } = await supabase
    .from('config')
    .update({ value: novaSenha, updated_at: new Date().toISOString() })
    .eq('key', 'senha')

  if (updateError) return { ok: false, erro: 'Erro ao salvar nova senha.' }

  return { ok: true }
}
