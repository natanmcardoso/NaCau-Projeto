// Formata valor monetário em pt-BR: R$ 1.234,56
export function formatMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

// Formata data ISO para DD/MM/AAAA
export function formatData(data: string): string {
  if (!data) return ''
  const [ano, mes, dia] = data.split('T')[0].split('-')
  return `${dia}/${mes}/${ano}`
}

// Retorna a data de hoje no formato YYYY-MM-DD (para inputs date)
export function hojeISO(): string {
  return new Date().toISOString().split('T')[0]
}

// Retorna o 2º dia útil do mês/ano (considera apenas fins de semana)
export function segundoDiaUtil(ano: number, mes: number): Date {
  let diasUteis = 0
  let dia = 1

  while (diasUteis < 2) {
    const data = new Date(ano, mes - 1, dia)
    const diaSemana = data.getDay()
    if (diaSemana !== 0 && diaSemana !== 6) {
      diasUteis++
    }
    if (diasUteis < 2) dia++
  }

  return new Date(ano, mes - 1, dia)
}

// Retorna o mês/ano atual no formato "Maio 2025"
export function mesAtualFormatado(): string {
  return new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

// Calcula o saldo VA restante no mês
export function saldoVARestante(vaInicial: number, gastosVA: number): number {
  return Math.max(0, vaInicial - gastosVA)
}

// Trunca texto com reticências
export function truncate(texto: string, max: number): string {
  return texto.length > max ? texto.slice(0, max) + '…' : texto
}

// Label legível para tipo de transação
export const TIPO_LABEL: Record<string, string> = {
  gasto: 'Gasto',
  ganho: 'Ganho',
  gasto_va: 'Gasto VA',
  salario: 'Salário',
  gasto_fixo: 'Gasto Fixo',
}

// Cor associada ao tipo de transação
export function corTipo(tipo: string): string {
  switch (tipo) {
    case 'ganho':
    case 'salario':
      return 'text-lime'
    case 'gasto':
    case 'gasto_fixo':
      return 'text-danger'
    case 'gasto_va':
      return 'text-blue'
    default:
      return 'text-muted'
  }
}
