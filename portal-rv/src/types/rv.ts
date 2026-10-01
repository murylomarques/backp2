export type StatusIndicador =
  | 'abaixo_da_meta'
  | 'proximo_da_meta'
  | 'meta_atingida'
  | 'pendente'
  | 'colisao_nome'

export interface Tecnico {
  matricula: string
  nome: string
  cargo: string
  supervisor: string
  coordenador: string
  regional: string
  cidade: string
}

export interface Indicador {
  id: string
  nome: string
  descricao?: string
  peso: number
  meta: number
  realizado: number
  unidade: 'percentual' | 'numero' | 'moeda'
  atingimento: number
  impactoNaRv: number
  status: StatusIndicador
}

export interface HistoricoMensal {
  mes: string
  competencia: string
  valorRv: number
  percentualAtingimento: number
}

export interface ResumoRv {
  periodoReferencia: string
  valorAtual: number
  metaRv: number
  percentualAtingido: number
  projecao: number
  indicadoresAtingidos: number
  totalIndicadores: number
}

export interface TecnicoRvData {
  tecnico: Tecnico
  resumo: ResumoRv
  indicadores: Indicador[]
  historico: HistoricoMensal[]
}

export class TecnicoNaoEncontradoError extends Error {
  constructor(matricula: string) {
    super(`Nenhum técnico encontrado para a matrícula "${matricula}".`)
    this.name = 'TecnicoNaoEncontradoError'
  }
}
