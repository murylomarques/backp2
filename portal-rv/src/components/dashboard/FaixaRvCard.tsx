import type { ComposicaoRv } from '../../types/consultorRv'
import { formatarNumero, formatarPercentual } from '../../utils/format'

interface FaixaRvCardProps {
  composicao: ComposicaoRv
}

const ESCALA_MAXIMA = 11
const NOMES_FAIXA = ['Desempenho Insuficiente', 'Desempenho Básico', 'Desempenho Adequado', 'Desempenho de Excelência']
const CORES_FAIXA = [
  { texto: 'text-status-danger', fundo: 'bg-status-danger-bg', barra: 'bg-status-danger' },
  { texto: 'text-status-warning', fundo: 'bg-status-warning-bg', barra: 'bg-status-warning' },
  { texto: 'text-status-success', fundo: 'bg-status-success-bg', barra: 'bg-status-success' },
  { texto: 'text-brand-red', fundo: 'bg-brand-cream', barra: 'bg-brand-gradient' },
]

const NOMES_INDICADOR: Record<string, string> = {
  produtividade: 'Produtividade (PU)',
  irr: 'IRR',
  ifi: 'IFI',
  ca_rep: 'CA REP',
  irt: 'IRT',
}

export function FaixaRvCard({ composicao }: FaixaRvCardProps) {
  const cor = CORES_FAIXA[composicao.faixa]
  const larguraBarra = Math.min((composicao.pontosTotais / ESCALA_MAXIMA) * 100, 100)

  return (
    <div className="rounded-2xl border border-brand-beige/60 bg-white p-6 shadow-card sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-charcoal/45">
            Como minha RV foi calculada — Faixa de atingimento
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-lg font-extrabold ${cor.fundo} ${cor.texto}`}>
              Faixa {composicao.faixa}
            </span>
            <span className="text-sm font-semibold text-brand-charcoal/70">
              {NOMES_FAIXA[composicao.faixa]}
            </span>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-2xl font-extrabold text-brand-dark">
            {formatarNumero(composicao.pontosTotais, 2)}{' '}
            <span className="text-sm font-medium text-brand-charcoal/50">de {ESCALA_MAXIMA} pontos</span>
          </p>
        </div>
      </div>

      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-brand-graylight">
        <div className={`h-full rounded-full ${cor.barra}`} style={{ width: `${larguraBarra}%` }} />
      </div>

      <p className="mt-4 rounded-lg bg-status-warning-bg px-3 py-2 text-xs text-status-warning">
        ⚠ Cálculo simplificado: indicadores sem meta oficial ou sem dado no período entram como
        neutros (100% do peso). Não considera ainda o Deflator por IRT, a escolha entre Modelo
        Produtividade/Qualidade nem regras de elegibilidade do Book — não é a Faixa oficial final.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-brand-beige/60 text-left text-xs font-bold uppercase tracking-wide text-brand-charcoal/50">
              <th className="py-2">Indicador</th>
              <th className="py-2">Peso</th>
              <th className="py-2">% dos pontos</th>
              <th className="py-2">Pontos</th>
            </tr>
          </thead>
          <tbody>
            {composicao.detalhes.map((detalhe) => (
              <tr key={detalhe.id} className="border-b border-brand-beige/30 last:border-0">
                <td className="py-2 font-semibold text-brand-dark">
                  {NOMES_INDICADOR[detalhe.id] ?? detalhe.id}
                  {detalhe.neutro && (
                    <span className="ml-2 rounded-full bg-brand-graylight px-2 py-0.5 text-[10px] font-semibold text-brand-charcoal/60">
                      neutro
                    </span>
                  )}
                </td>
                <td className="py-2 text-brand-charcoal/70">{formatarNumero(detalhe.peso, 2)}</td>
                <td className="py-2 text-brand-charcoal/70">{formatarPercentual(detalhe.percentualPontos, 0)}</td>
                <td className="py-2 font-semibold text-brand-dark">{formatarNumero(detalhe.pontos, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
