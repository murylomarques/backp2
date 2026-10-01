import { pool } from './db.js'
import { calcularPu } from './puTable.js'
import { buscarMetaTerritorio, METAS_QUALIDADE_CONSULTOR } from './territorios.js'
import { calcularComposicaoRv } from './faixaConsultor.js'

/**
 * Peso de cada indicador do Consultor Técnico, conforme o Book de RV (Quadro 2/3).
 * Indicadores sem fonte de dados confirmada ficam com meta/realizado nulos e
 * status "pendente" — nunca inventamos o valor.
 */
const INDICADORES_CONSULTOR = [
  { id: 'produtividade', nome: 'Produtividade (PU)', peso: 2.0, disponivel: true, unidade: 'numero' },
  { id: 'irr', nome: 'Índice de Reparo Repetido (IRR)', peso: 3.0, disponivel: true, unidade: 'percentual' },
  { id: 'ifi', nome: 'Índice de Falha na Instalação (IFI)', peso: 0.5, disponivel: true, unidade: 'percentual' },
  { id: 'ca_rep', nome: 'Conclusão de Agenda — Reparo (CA REP)', peso: 3.5, disponivel: true, unidade: 'percentual' },
]

// IRR/IFI/CA REP: o REALIZADO já é calculável com dado real da VIEW_BSC (flags
// abaixo). A META oficial desses três ainda não foi confirmada pelo Planejamento
// de Operações — por isso ficam com meta nula (sem julgamento de status) até
// que a meta bruta seja trazida, mas o valor realizado NÃO é mais inventado.
function calcularIndicadoresDeFlag(concluidas) {
  const reparos = concluidas.filter((r) => r.TIPO_OS === 'REPARO')
  const ativacoes = concluidas.filter((r) => r.TIPO_OS === 'ATIVAÇÃO')
  const reparosComAgendaConhecida = reparos.filter((r) => r.Flag_AG === '1' || r.Flag_AG === '0')

  const irrRealizado =
    reparos.length > 0
      ? Math.round((reparos.filter((r) => r.Flag_IRR === '1').length / reparos.length) * 1000) / 10
      : null

  const ifiRealizado =
    ativacoes.length > 0
      ? Math.round((ativacoes.filter((r) => r.Flag_IFI === '1').length / ativacoes.length) * 1000) / 10
      : null

  const caRepRealizado =
    reparosComAgendaConhecida.length > 0
      ? Math.round(
          (reparosComAgendaConhecida.filter((r) => r.Flag_AG === '1').length /
            reparosComAgendaConhecida.length) *
            1000,
        ) / 10
      : null

  return {
    irr: {
      realizado: irrRealizado,
      baseCalculo: reparos.length,
      motivoSemDado: 'O técnico não concluiu nenhum reparo neste período — IRR mede reincidência entre reparos.',
    },
    ifi: {
      realizado: ifiRealizado,
      baseCalculo: ativacoes.length,
      motivoSemDado: 'O técnico não concluiu nenhuma ativação neste período — IFI só existe quando há instalação para medir.',
    },
    ca_rep: {
      realizado: caRepRealizado,
      baseCalculo: reparosComAgendaConhecida.length,
      motivoSemDado: 'O técnico não concluiu nenhum reparo com cumprimento de agenda registrado neste período.',
    },
  }
}

function inicioFimMes(periodoAaaaMm) {
  const [ano, mes] = periodoAaaaMm.split('-').map(Number)
  const inicio = new Date(Date.UTC(ano, mes - 1, 1))
  const fim = new Date(Date.UTC(ano, mes, 1))
  return { inicio, fim }
}

function statusPorAtingimento(atingimentoPercentual) {
  if (atingimentoPercentual >= 100) return 'meta_atingida'
  if (atingimentoPercentual >= 85) return 'proximo_da_meta'
  return 'abaixo_da_meta'
}

/**
 * Para indicadores "quanto menor melhor" (taxas de falha/reincidência como IRR/IFI),
 * o atingimento é meta ÷ realizado (realizado menor que a meta = atingimento > 100%).
 * Para os demais (quanto maior melhor, ex: Produtividade), é realizado ÷ meta.
 */
function calcularAtingimento(realizado, meta, quantoMenorMelhor) {
  const razao = quantoMenorMelhor ? meta / realizado : realizado / meta
  return Math.round(razao * 1000) / 10
}

// Um técnico de campo real atende uma região pequena e tem um volume mensal
// fisicamente limitado de OS. Combinação de volume implausível + muitas cidades
// distintas é sinal de que LOGIN_TECNICO (o nome) está agregando mais de uma
// pessoa real — não existe matrícula única na VIEW_BSC para desambiguar.
// Calibrado com dados reais: um técnico legítimo cobrindo território (várias
// cidades vizinhas) fica bem abaixo destes limites; nomes colididos (ex: 1500
// OS em 27 cidades) estouram os dois ao mesmo tempo.
const LIMITE_OS_MENSAL_SEM_COLISAO = 400
const LIMITE_CIDADES_SEM_COLISAO = 10

export async function buscarTecnicosPorNome(termo) {
  const busca = termo.trim()
  if (busca.length < 3) return []

  const [rows] = await pool.query(
    `SELECT DISTINCT LOGIN_TECNICO, CIDADE, REGIONAL
     FROM VIEW_BSC
     WHERE LOGIN_TECNICO LIKE ?
       AND PERIODO_FECHAMENTO >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       AND TECNICO_PROPRIO_TERCEIRO IS NOT NULL
     ORDER BY LOGIN_TECNICO
     LIMIT 15`,
    [`%${busca}%`],
  )

  const vistos = new Set()
  const resultado = []
  for (const row of rows) {
    if (vistos.has(row.LOGIN_TECNICO)) continue
    vistos.add(row.LOGIN_TECNICO)
    resultado.push({ nome: row.LOGIN_TECNICO, cidade: row.CIDADE, regional: row.REGIONAL })
  }
  return resultado
}

export async function buscarRvConsultor(loginTecnico, periodoAaaaMm) {
  const { inicio, fim } = inicioFimMes(periodoAaaaMm)

  const [rowsBrutas] = await pool.query(
    `SELECT ID_OSS, ID_ATENDIMENTO, ID_CLIENTE, TIPO_OS, DESCRICAO_OS, STATUS_OS, CIDADE, REGIONAL,
            PERIODO_FECHAMENTO, DT_FECHAMENTO, Flag_IRR, Flag_IFI, Flag_AG
     FROM VIEW_BSC
     WHERE LOGIN_TECNICO = ?
       AND PERIODO_FECHAMENTO >= ?
       AND PERIODO_FECHAMENTO < ?`,
    [loginTecnico, inicio, fim],
  )

  if (rowsBrutas.length === 0) {
    return null
  }

  // A VIEW_BSC pode repetir a mesma OS em múltiplas linhas (join com outras
  // tabelas). Deduplicamos por ID_OSS+ID_ATENDIMENTO, igual ao load_view_bsc.py.
  const rows = Array.from(
    new Map(rowsBrutas.map((r) => [`${r.ID_OSS}|${r.ID_ATENDIMENTO}`, r])).values(),
  )

  const concluidas = rows.filter((r) => r.STATUS_OS === 'Concluída')

  let somaPu = 0
  let qtdMapeadas = 0
  let qtdNaoMapeadas = 0
  const contagemTerritorio = new Map()
  const diasTrabalhados = new Set()

  for (const row of concluidas) {
    const pu = calcularPu(row.TIPO_OS, row.DESCRICAO_OS)
    if (pu === null) {
      qtdNaoMapeadas += 1
    } else {
      somaPu += pu
      qtdMapeadas += 1
    }

    const chaveTerritorio = `${row.REGIONAL}|${row.CIDADE}`
    contagemTerritorio.set(chaveTerritorio, (contagemTerritorio.get(chaveTerritorio) || 0) + 1)

    if (row.DT_FECHAMENTO) {
      diasTrabalhados.add(new Date(row.DT_FECHAMENTO).toISOString().slice(0, 10))
    }
  }

  let territorioPrincipal = { regional: null, cidade: null }
  let maiorContagem = 0
  for (const [chave, contagem] of contagemTerritorio) {
    if (contagem > maiorContagem) {
      maiorContagem = contagem
      const [regional, cidade] = chave.split('|')
      territorioPrincipal = { regional, cidade }
    }
  }

  const cidadesDistintas = Array.from(
    new Set(rows.map((r) => r.CIDADE).filter(Boolean)),
  )
  const colisaoSuspeita =
    concluidas.length > LIMITE_OS_MENSAL_SEM_COLISAO && cidadesDistintas.length > LIMITE_CIDADES_SEM_COLISAO

  if (colisaoSuspeita) {
    const indicadoresColisao = INDICADORES_CONSULTOR.map((base) => ({
      ...base,
      meta: null,
      realizado: null,
      atingimento: null,
      status: 'colisao_nome',
    }))

    return {
      tecnico: {
        nome: loginTecnico,
        cidade: territorioPrincipal.cidade,
        regional: territorioPrincipal.regional,
      },
      periodo: periodoAaaaMm,
      indicadores: indicadoresColisao,
      alerta: {
        tipo: 'COLISAO_NOME_PROVAVEL',
        mensagem:
          'Este nome aparece com atendimentos em muitas cidades diferentes no mesmo período — provavelmente ' +
          'corresponde a mais de um técnico real (não existe matrícula na base para diferenciar). Os indicadores ' +
          'não são exibidos para evitar mostrar um número incorreto.',
        cidadesEncontradas: cidadesDistintas,
      },
      qualidadeDados: {
        linhasBrutasNaView: rowsBrutas.length,
        linhasDuplicadasRemovidas: rowsBrutas.length - rows.length,
        totalOsConcluidas: concluidas.length,
        territorioTemMetaCadastrada: false,
      },
    }
  }

  const metaTerritorio = buscarMetaTerritorio(territorioPrincipal.regional, territorioPrincipal.cidade)
  const indicadoresDeFlag = calcularIndicadoresDeFlag(concluidas)

  const indicadores = INDICADORES_CONSULTOR.map((base) => {
    if (base.id === 'irr' || base.id === 'ifi' || base.id === 'ca_rep') {
      const { realizado, baseCalculo, motivoSemDado } = indicadoresDeFlag[base.id]
      if (realizado === null) {
        return {
          ...base,
          meta: null,
          realizado: null,
          atingimento: null,
          status: 'pendente',
          observacao: motivoSemDado,
        }
      }
      const metaQualidade = METAS_QUALIDADE_CONSULTOR[base.id]
      if (!metaQualidade) {
        // Meta oficial ainda não confirmada pelo Planejamento de Operações: mostramos
        // o valor realizado real, sem status de atingimento (não julgamos sem meta).
        return { ...base, meta: null, realizado, atingimento: null, status: 'pendente', baseCalculo }
      }

      const atingimento = calcularAtingimento(realizado, metaQualidade.meta, metaQualidade.quantoMenorMelhor)
      return {
        ...base,
        meta: metaQualidade.meta,
        tolerável: metaQualidade.tolerável,
        superação: metaQualidade.superação,
        realizado,
        baseCalculo,
        atingimento,
        status: statusPorAtingimento(atingimento),
      }
    }

    // A meta do Planejamento de Operações é uma média DIÁRIA de PU, não a soma do mês.
    const somaPuArredondada = Math.round(somaPu * 100) / 100
    if (diasTrabalhados.size === 0) {
      return { ...base, meta: null, realizado: null, atingimento: null, status: 'pendente' }
    }
    const realizado = Math.round((somaPu / diasTrabalhados.size) * 100) / 100

    if (!metaTerritorio) {
      return { ...base, meta: null, realizado, atingimento: null, status: 'pendente' }
    }

    const meta = metaTerritorio.produtividade.meta
    const atingimento = Math.round((realizado / meta) * 1000) / 10
    return {
      ...base,
      meta,
      tolerável: metaTerritorio.produtividade.tolerável,
      superação: metaTerritorio.produtividade.superação,
      realizado,
      realizadoTotalNoMes: somaPuArredondada,
      diasTrabalhados: diasTrabalhados.size,
      atingimento,
      status: statusPorAtingimento(atingimento),
    }
  })

  return {
    tecnico: {
      nome: loginTecnico,
      cidade: territorioPrincipal.cidade,
      regional: territorioPrincipal.regional,
    },
    periodo: periodoAaaaMm,
    indicadores,
    composicaoRv: calcularComposicaoRv(indicadores),
    qualidadeDados: {
      linhasBrutasNaView: rowsBrutas.length,
      linhasDuplicadasRemovidas: rowsBrutas.length - rows.length,
      totalOsConcluidas: concluidas.length,
      osComPuMapeado: qtdMapeadas,
      osSemPuMapeado: qtdNaoMapeadas,
      territorioTemMetaCadastrada: Boolean(metaTerritorio),
    },
  }
}
