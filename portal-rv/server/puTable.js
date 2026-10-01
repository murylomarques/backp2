/**
 * Tabela de PU (Pontuação Única) — Quadro 1 do Book de Remuneração Variável
 * "OPERAÇÕES | CASA-CLIENTE", versão 1.1 (12/02/2026).
 *
 * Cada regra casa por TIPO_OS + um trecho contido em DESCRICAO_OS (case-insensitive).
 * A primeira regra que casar (na ordem abaixo) define o peso PU do atendimento.
 * Atendimentos que não casam com nenhuma regra NÃO entram na soma de Produtividade —
 * ficam contabilizados à parte como "não mapeados", para não inventar peso.
 */
export const REGRAS_PU = [
  { tipoOs: 'REPARO', contem: 'corretiva', pu: 0.75, nome: 'Reparo' },
  { tipoOs: 'REPARO PREV', contem: 'preventiva', pu: 0.75, nome: 'Reparo Preventivo' },

  { tipoOs: 'ATIVAÇÃO', contem: 'mesh', eContem: 'tv', pu: 2.0, nome: 'Ativação + Mesh + TV' },
  { tipoOs: 'ATIVAÇÃO', contem: 'mesh', pu: 1.5, nome: 'Ativação + Mesh' },
  { tipoOs: 'ATIVAÇÃO', contem: 'tv', pu: 0.8, nome: 'Ativação TV' },
  { tipoOs: 'ATIVAÇÃO', contem: 'internet', pu: 1.0, nome: 'Ativação' },

  { tipoOs: 'MUD END', contem: 'internet', pu: 1.0, nome: 'Mudança de Endereço' },

  { tipoOs: 'RETIRADA', contem: '', pu: 0.6, nome: 'Retirada' },

  { tipoOs: 'OUTROS SERVIÇOS', contem: 'entrega de chip', pu: 0.4, nome: 'Entrega de Chip' },
  { tipoOs: 'OUTROS SERVIÇOS', contem: 'migração olt', pu: 0.8, nome: 'Migração OLT Zhone/Fiberhome' },
  { tipoOs: 'OUTROS SERVIÇOS', contem: 'zhone', pu: 0.8, nome: 'Migração OLT Zhone/Fiberhome' },
  { tipoOs: 'OUTROS SERVIÇOS', contem: 'mudança de plano', pu: 0.8, nome: 'Mudança de Plano' },
]

function normalizar(texto) {
  return (texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/**
 * Retorna o peso PU do atendimento, ou null se não houver regra correspondente
 * (o atendimento fica fora da soma de Produtividade e é contado como "não mapeado").
 */
export function calcularPu(tipoOs, descricaoOs) {
  const tipoNorm = normalizar(tipoOs)
  const descNorm = normalizar(descricaoOs)

  for (const regra of REGRAS_PU) {
    if (normalizar(regra.tipoOs) !== tipoNorm) continue
    if (regra.contem && !descNorm.includes(normalizar(regra.contem))) continue
    if (regra.eContem && !descNorm.includes(normalizar(regra.eContem))) continue
    return regra.pu
  }
  return null
}
