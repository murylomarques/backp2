import type { ConsultorRvData, SugestaoTecnico } from '../../types/consultorRv'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'

export class BscIndisponivelError extends Error {
  constructor(mensagem: string) {
    super(mensagem)
    this.name = 'BscIndisponivelError'
  }
}

export class TecnicoSemDadosError extends Error {
  constructor(mensagem: string) {
    super(mensagem)
    this.name = 'TecnicoSemDadosError'
  }
}

export async function buscarSugestoesTecnico(termo: string): Promise<SugestaoTecnico[]> {
  if (termo.trim().length < 3) return []

  const resposta = await fetch(`${API_BASE_URL}/api/tecnicos/buscar?q=${encodeURIComponent(termo)}`)
  if (!resposta.ok) {
    throw new BscIndisponivelError('Não foi possível buscar técnicos agora. Tente novamente em instantes.')
  }
  const dados = await resposta.json()
  return dados.resultados as SugestaoTecnico[]
}

export async function buscarRvConsultor(nomeTecnico: string, periodo: string): Promise<ConsultorRvData> {
  const resposta = await fetch(
    `${API_BASE_URL}/api/tecnicos/${encodeURIComponent(nomeTecnico)}/rv?periodo=${encodeURIComponent(periodo)}`,
  )

  if (resposta.status === 404) {
    throw new TecnicoSemDadosError('Não encontramos ordens de serviço para este técnico no período informado.')
  }

  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => null)
    throw new BscIndisponivelError(
      corpo?.mensagem ?? 'O BSC está temporariamente indisponível. Tente novamente em instantes.',
    )
  }

  return (await resposta.json()) as ConsultorRvData
}
