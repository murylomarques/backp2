/**
 * Composição da Faixa final do Consultor Técnico, conforme o Book de RV
 * (seção 7 "Faixas de Atingimento" + Quadro 2 "Modelo Produtividade").
 *
 * Cada indicador vale pontos entre 0% e 110% do seu peso:
 *   - Tolerável  -> 50% do peso
 *   - Meta       -> 100% do peso
 *   - Superação  -> 110% do peso (teto)
 *   - Abaixo do Tolerável -> 0
 * Interpolação linear entre os pontos de referência.
 *
 * Peso total do Consultor Técnico (Quadro 2, Modelo Produtividade):
 * CA REP 3,5 + IRR 3,0 + IFI 0,5 + IRT 1,0 + Produtividade 2,0 = 10,0
 * (bate com a escala de Faixas do Book: 0–11 pontos, já que 110% de 10 = 11).
 */
export const PESO_TOTAL_CONSULTOR = 10.0

const DIRECAO_QUANTO_MENOR_MELHOR = {
  irr: true,
  ifi: true,
  ca_rep: false,
  produtividade: false,
}

// IRT não é medido ainda (sem fonte de "Acessos" confiável) — entra na composição
// como neutro (100% do peso), igual a qualquer indicador sem dado no período.
const PESO_IRT_NAO_MEDIDO = 1.0

function percentualDePontos(realizado, tolerável, meta, superação, quantoMenorMelhor) {
  if (quantoMenorMelhor) {
    if (realizado <= superação) return 110
    if (realizado <= meta) {
      return meta === superação ? 100 : 100 + ((meta - realizado) / (meta - superação)) * 10
    }
    if (realizado <= tolerável) {
      return tolerável === meta ? 50 : 50 + ((tolerável - realizado) / (tolerável - meta)) * 50
    }
    return 0
  }

  if (realizado >= superação) return 110
  if (realizado >= meta) {
    return superação === meta ? 100 : 100 + ((realizado - meta) / (superação - meta)) * 10
  }
  if (realizado >= tolerável) {
    return meta === tolerável ? 50 : 50 + ((realizado - tolerável) / (meta - tolerável)) * 50
  }
  return 0
}

function faixaPorPontos(pontos) {
  if (pontos <= 4.9) return 0
  if (pontos <= 7.5) return 1
  if (pontos <= 10.0) return 2
  return 3
}

/**
 * Recebe os indicadores já calculados (com peso/meta/tolerável/superação/realizado)
 * e devolve a composição de pontos e a Faixa final (0-3).
 *
 * Indicador sem dado ou sem meta oficial: conta como NEUTRO (100% do peso) — decisão
 * confirmada com o usuário, para não penalizar nem beneficiar por ausência de dado.
 */
export function calcularComposicaoRv(indicadores) {
  const detalhes = indicadores.map((indicador) => {
    const semDadoOuMeta = indicador.realizado === null || indicador.meta === null

    if (semDadoOuMeta) {
      return {
        id: indicador.id,
        peso: indicador.peso,
        percentualPontos: 100,
        pontos: indicador.peso,
        neutro: true,
      }
    }

    const quantoMenorMelhor = DIRECAO_QUANTO_MENOR_MELHOR[indicador.id] ?? false
    const percentualPontos = Math.round(
      percentualDePontos(
        indicador.realizado,
        indicador.tolerável,
        indicador.meta,
        indicador.superação,
        quantoMenorMelhor,
      ) * 10,
    ) / 10
    const pontos = Math.round(((indicador.peso * percentualPontos) / 100) * 100) / 100

    return { id: indicador.id, peso: indicador.peso, percentualPontos, pontos, neutro: false }
  })

  detalhes.push({
    id: 'irt',
    peso: PESO_IRT_NAO_MEDIDO,
    percentualPontos: 100,
    pontos: PESO_IRT_NAO_MEDIDO,
    neutro: true,
  })

  const pontosTotais = Math.round(detalhes.reduce((soma, d) => soma + d.pontos, 0) * 100) / 100

  return {
    pesoTotal: PESO_TOTAL_CONSULTOR,
    pontosTotais,
    faixa: faixaPorPontos(pontosTotais),
    detalhes,
  }
}
