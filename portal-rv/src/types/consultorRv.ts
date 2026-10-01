import type { StatusIndicador } from './rv'

export interface TecnicoResumo {
  nome: string
  cidade: string | null
  regional: string | null
}

export interface IndicadorConsultor {
  id: string
  nome: string
  peso: number
  disponivel: boolean
  unidade: 'numero' | 'percentual'
  meta: number | null
  tolerável?: number
  superação?: number
  realizado: number | null
  realizadoTotalNoMes?: number
  diasTrabalhados?: number
  baseCalculo?: number
  observacao?: string
  atingimento: number | null
  status: StatusIndicador
}

export interface AlertaColisaoNome {
  tipo: 'COLISAO_NOME_PROVAVEL'
  mensagem: string
  cidadesEncontradas: string[]
}

export interface QualidadeDados {
  linhasBrutasNaView: number
  linhasDuplicadasRemovidas: number
  totalOsConcluidas: number
  osComPuMapeado?: number
  osSemPuMapeado?: number
  territorioTemMetaCadastrada: boolean
}

export interface DetalheComposicaoIndicador {
  id: string
  peso: number
  percentualPontos: number
  pontos: number
  neutro: boolean
}

export interface ComposicaoRv {
  pesoTotal: number
  pontosTotais: number
  faixa: 0 | 1 | 2 | 3
  detalhes: DetalheComposicaoIndicador[]
}

export interface ConsultorRvData {
  tecnico: TecnicoResumo
  periodo: string
  indicadores: IndicadorConsultor[]
  composicaoRv?: ComposicaoRv
  alerta?: AlertaColisaoNome
  qualidadeDados: QualidadeDados
}

export interface SugestaoTecnico {
  nome: string
  cidade: string | null
  regional: string | null
}
