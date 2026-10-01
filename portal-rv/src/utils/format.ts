export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}

export function formatarPercentual(valor: number, casasDecimais = 1): string {
  return `${valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  })}%`
}

export function formatarNumero(valor: number, casasDecimais = 1): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  })
}

export function formatarValorIndicador(valor: number, unidade: 'percentual' | 'numero' | 'moeda'): string {
  if (unidade === 'percentual') return formatarPercentual(valor)
  if (unidade === 'moeda') return formatarMoeda(valor)
  return formatarNumero(valor)
}

export function obterIniciais(nomeCompleto: string): string {
  const partes = nomeCompleto.trim().split(/\s+/)
  const primeira = partes[0]?.[0] ?? ''
  const ultima = partes.length > 1 ? partes[partes.length - 1]?.[0] ?? '' : ''
  return `${primeira}${ultima}`.toUpperCase()
}
