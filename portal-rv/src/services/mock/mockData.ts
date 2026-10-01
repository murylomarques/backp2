import type { TecnicoRvData } from '../../types/rv'

function statusFromAtingimento(atingimento: number) {
  if (atingimento >= 100) return 'meta_atingida' as const
  if (atingimento >= 85) return 'proximo_da_meta' as const
  return 'abaixo_da_meta' as const
}

function indicador(
  id: string,
  nome: string,
  peso: number,
  meta: number,
  realizado: number,
  unidade: 'percentual' | 'numero' | 'moeda',
  descricao?: string,
) {
  const atingimento = Math.round((realizado / meta) * 1000) / 10
  const impactoNaRv = Math.round(Math.min(atingimento, 120) * (peso / 100) * 10) / 10
  return {
    id,
    nome,
    descricao,
    peso,
    meta,
    realizado,
    unidade,
    atingimento,
    impactoNaRv,
    status: statusFromAtingimento(atingimento),
  }
}

export const MOCK_TECNICOS: Record<string, TecnicoRvData> = {
  '10234': {
    tecnico: {
      matricula: '10234',
      nome: 'Rafael Souza Almeida',
      cargo: 'Técnico de Campo Pleno',
      supervisor: 'Marcos Vinícius Costa',
      coordenador: 'Fernanda Lima Ribeiro',
      regional: 'Regional Sudeste',
      cidade: 'Belo Horizonte / MG',
    },
    resumo: {
      periodoReferencia: 'Setembro/2026',
      valorAtual: 1847.32,
      metaRv: 2100,
      percentualAtingido: 88,
      projecao: 1980.5,
      indicadoresAtingidos: 3,
      totalIndicadores: 5,
    },
    indicadores: [
      indicador('csat', 'Satisfação do Cliente (CSAT)', 25, 95, 97.2, 'percentual', 'Percentual de clientes satisfeitos com o atendimento realizado.'),
      indicador('sla', 'SLA de Atendimento', 25, 90, 88.4, 'percentual', 'Percentual de ordens de serviço atendidas dentro do prazo.'),
      indicador('produtividade', 'Produtividade (OS/dia)', 20, 8, 7.2, 'numero', 'Média de ordens de serviço concluídas por dia útil.'),
      indicador('qualidade', 'Qualidade Técnica (Retrabalho)', 20, 95, 91.5, 'percentual', 'Percentual de serviços concluídos sem necessidade de retrabalho.'),
      indicador('absenteismo', 'Assiduidade', 10, 98, 99.1, 'percentual', 'Percentual de presença em relação aos dias programados.'),
    ],
    historico: [
      { mes: 'Abr', competencia: '2026-04', valorRv: 1620.4, percentualAtingimento: 77 },
      { mes: 'Mai', competencia: '2026-05', valorRv: 1710.9, percentualAtingimento: 81 },
      { mes: 'Jun', competencia: '2026-06', valorRv: 1755.2, percentualAtingimento: 83 },
      { mes: 'Jul', competencia: '2026-07', valorRv: 1802.6, percentualAtingimento: 86 },
      { mes: 'Ago', competencia: '2026-08', valorRv: 1780.15, percentualAtingimento: 85 },
      { mes: 'Set', competencia: '2026-09', valorRv: 1847.32, percentualAtingimento: 88 },
    ],
  },
  '20567': {
    tecnico: {
      matricula: '20567',
      nome: 'Juliana Pereira Santos',
      cargo: 'Técnica de Campo Sênior',
      supervisor: 'Carlos Eduardo Martins',
      coordenador: 'Fernanda Lima Ribeiro',
      regional: 'Regional Sul',
      cidade: 'Curitiba / PR',
    },
    resumo: {
      periodoReferencia: 'Setembro/2026',
      valorAtual: 2340.0,
      metaRv: 2200,
      percentualAtingido: 106,
      projecao: 2390.0,
      indicadoresAtingidos: 5,
      totalIndicadores: 5,
    },
    indicadores: [
      indicador('csat', 'Satisfação do Cliente (CSAT)', 25, 95, 98.6, 'percentual', 'Percentual de clientes satisfeitos com o atendimento realizado.'),
      indicador('sla', 'SLA de Atendimento', 25, 90, 96.1, 'percentual', 'Percentual de ordens de serviço atendidas dentro do prazo.'),
      indicador('produtividade', 'Produtividade (OS/dia)', 20, 8, 9.1, 'numero', 'Média de ordens de serviço concluídas por dia útil.'),
      indicador('qualidade', 'Qualidade Técnica (Retrabalho)', 20, 95, 97.8, 'percentual', 'Percentual de serviços concluídos sem necessidade de retrabalho.'),
      indicador('absenteismo', 'Assiduidade', 10, 98, 100, 'percentual', 'Percentual de presença em relação aos dias programados.'),
    ],
    historico: [
      { mes: 'Abr', competencia: '2026-04', valorRv: 2050.0, percentualAtingimento: 93 },
      { mes: 'Mai', competencia: '2026-05', valorRv: 2110.4, percentualAtingimento: 96 },
      { mes: 'Jun', competencia: '2026-06', valorRv: 2205.7, percentualAtingimento: 100 },
      { mes: 'Jul', competencia: '2026-07', valorRv: 2260.3, percentualAtingimento: 102 },
      { mes: 'Ago', competencia: '2026-08', valorRv: 2298.8, percentualAtingimento: 104 },
      { mes: 'Set', competencia: '2026-09', valorRv: 2340.0, percentualAtingimento: 106 },
    ],
  },
  '30891': {
    tecnico: {
      matricula: '30891',
      nome: 'Anderson Costa Oliveira',
      cargo: 'Técnico de Campo Júnior',
      supervisor: 'Marcos Vinícius Costa',
      coordenador: 'Paulo Henrique Nunes',
      regional: 'Regional Nordeste',
      cidade: 'Recife / PE',
    },
    resumo: {
      periodoReferencia: 'Setembro/2026',
      valorAtual: 1210.8,
      metaRv: 1900,
      percentualAtingido: 64,
      projecao: 1340.0,
      indicadoresAtingidos: 1,
      totalIndicadores: 5,
    },
    indicadores: [
      indicador('csat', 'Satisfação do Cliente (CSAT)', 25, 95, 84.3, 'percentual', 'Percentual de clientes satisfeitos com o atendimento realizado.'),
      indicador('sla', 'SLA de Atendimento', 25, 90, 71.6, 'percentual', 'Percentual de ordens de serviço atendidas dentro do prazo.'),
      indicador('produtividade', 'Produtividade (OS/dia)', 20, 8, 5.8, 'numero', 'Média de ordens de serviço concluídas por dia útil.'),
      indicador('qualidade', 'Qualidade Técnica (Retrabalho)', 20, 95, 80.2, 'percentual', 'Percentual de serviços concluídos sem necessidade de retrabalho.'),
      indicador('absenteismo', 'Assiduidade', 10, 98, 95.4, 'percentual', 'Percentual de presença em relação aos dias programados.'),
    ],
    historico: [
      { mes: 'Abr', competencia: '2026-04', valorRv: 1380.0, percentualAtingimento: 73 },
      { mes: 'Mai', competencia: '2026-05', valorRv: 1320.5, percentualAtingimento: 70 },
      { mes: 'Jun', competencia: '2026-06', valorRv: 1275.9, percentualAtingimento: 67 },
      { mes: 'Jul', competencia: '2026-07', valorRv: 1298.4, percentualAtingimento: 68 },
      { mes: 'Ago', competencia: '2026-08', valorRv: 1230.1, percentualAtingimento: 65 },
      { mes: 'Set', competencia: '2026-09', valorRv: 1210.8, percentualAtingimento: 64 },
    ],
  },
}
