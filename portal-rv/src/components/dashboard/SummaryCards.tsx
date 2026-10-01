import type { ResumoRv } from '../../types/rv'
import { formatarMoeda, formatarPercentual } from '../../utils/format'

interface SummaryCardsProps {
  resumo: ResumoRv
}

export function SummaryCards({ resumo }: SummaryCardsProps) {
  const atingiuMeta = resumo.percentualAtingido >= 100

  const cards = [
    {
      label: 'Sua RV atual',
      valor: formatarMoeda(resumo.valorAtual),
      sublabel: `Meta: ${formatarMoeda(resumo.metaRv)}`,
      icone: '💰',
    },
    {
      label: 'Atingimento',
      valor: formatarPercentual(resumo.percentualAtingido, 0),
      sublabel: atingiuMeta ? 'Meta batida neste período' : 'Em relação à meta do período',
      icone: '🎯',
      destaque: atingiuMeta,
    },
    {
      label: 'Projeção',
      valor: formatarMoeda(resumo.projecao),
      sublabel: 'Estimativa até o fechamento',
      icone: '📈',
    },
    {
      label: 'Indicadores atingidos',
      valor: `${resumo.indicadoresAtingidos} de ${resumo.totalIndicadores}`,
      sublabel: 'Indicadores com meta batida',
      icone: '✅',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-2xl border p-4 shadow-card transition hover:shadow-card-hover sm:p-5 ${
            card.destaque ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-beige/60 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-charcoal/50">
              {card.label}
            </p>
            <span className="text-lg" aria-hidden>
              {card.icone}
            </span>
          </div>
          <p className="mt-2 text-xl font-extrabold text-brand-dark sm:text-2xl">{card.valor}</p>
          <p className="mt-1 text-xs text-brand-charcoal/50">{card.sublabel}</p>
        </div>
      ))}
    </div>
  )
}
