/**
 * Metas brutas de PRODUTIVIDADE e IRT por território — competência set/2026,
 * conforme planilha do Planejamento de Operações. Cada território é identificado
 * por REGIONAL + CIDADE (a cidade-referência do território, como aparece na VIEW_BSC).
 *
 * Territórios fora desta lista não têm meta comparável ainda — o portal mostra
 * o valor realizado, mas marca a meta como indisponível em vez de adivinhar.
 */
export const METAS_TERRITORIO = {
  'CENTRAL|SUMARÉ': {
    produtividade: { tolerável: 2.1, meta: 2.6, superação: 3.1 },
    irt: { superação: 0.038, meta: 0.043, tolerável: 0.048 },
  },
  'CENTRAL|SOROCABA': {
    produtividade: { tolerável: 2.1, meta: 2.6, superação: 3.1 },
    irt: { superação: 0.037, meta: 0.042, tolerável: 0.047 },
  },
  'CENTRAL|CAMPINAS': {
    produtividade: { tolerável: 2.1, meta: 2.6, superação: 3.1 },
    irt: { superação: 0.039, meta: 0.044, tolerável: 0.049 },
  },
  'CENTRO OESTE|LENÇÓIS PAULISTA': {
    produtividade: { tolerável: 2.1, meta: 2.6, superação: 3.1 },
    irt: { superação: 0.033, meta: 0.038, tolerável: 0.043 },
  },
  'CENTRO OESTE|ARARAQUARA': {
    produtividade: { tolerável: 2.1, meta: 2.6, superação: 3.1 },
    irt: { superação: 0.037, meta: 0.042, tolerável: 0.047 },
  },
  'CENTRO OESTE|BARRETOS': {
    produtividade: { tolerável: 2.1, meta: 2.6, superação: 3.1 },
    irt: { superação: 0.033, meta: 0.038, tolerável: 0.043 },
  },
  'SUDESTE|PRAIA GRANDE': {
    produtividade: { tolerável: 2.0, meta: 2.5, superação: 3.0 },
    irt: { superação: 0.042, meta: 0.047, tolerável: 0.052 },
  },
  'SUDESTE|S J DOS CAMPOS': {
    produtividade: { tolerável: 2.1, meta: 2.6, superação: 3.1 },
    irt: { superação: 0.041, meta: 0.046, tolerável: 0.051 },
  },
  'SUDESTE|JUNDIAÍ': {
    produtividade: { tolerável: 1.8, meta: 2.3, superação: 2.8 },
    irt: { superação: 0.042, meta: 0.047, tolerável: 0.052 },
  },
}

export function buscarMetaTerritorio(regional, cidade) {
  if (!regional || !cidade) return null
  const chave = `${regional.trim().toUpperCase()}|${cidade.trim().toUpperCase()}`
  return METAS_TERRITORIO[chave] ?? null
}

/**
 * Metas brutas de indicadores de QUALIDADE — competência set/2026, planilha do
 * Planejamento de Operações. Diferente das metas de Produtividade/IRT, estas não
 * variam por território (valor único da empresa). `quantoMenorMelhor: true`
 * significa que o realizado abaixo da meta é o resultado bom (taxa de falha).
 */
export const METAS_QUALIDADE_CONSULTOR = {
  ifi: { superação: 3.0, meta: 3.5, tolerável: 4.0, quantoMenorMelhor: true },
  irr: { superação: 7.8, meta: 8.3, tolerável: 8.8, quantoMenorMelhor: true },
  // "Cumprimento de Primeira Agenda" de Reparos no Book de Metas = CA REP do Book de RV.
  ca_rep: { superação: 92.0, meta: 87.0, tolerável: 82.0, quantoMenorMelhor: false },
}
