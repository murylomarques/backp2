import type { Indicador } from '../../types/rv'
import { formatarPercentual, formatarValorIndicador } from '../../utils/format'
import { ProgressBar } from '../ui/ProgressBar'
import { StatusBadge } from '../ui/StatusBadge'

interface IndicatorCardProps {
  indicador: Indicador
}

export function IndicatorCard({ indicador }: IndicatorCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-brand-beige/60 bg-white p-5 shadow-card transition hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-brand-dark">{indicador.nome}</h3>
          {indicador.descricao && (
            <p className="mt-1 text-xs leading-snug text-brand-charcoal/55">{indicador.descricao}</p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-brand-cream px-2 py-1 text-[11px] font-semibold text-brand-charcoal/70">
          Peso {indicador.peso}%
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-charcoal/45">Meta</p>
          <p className="font-semibold text-brand-dark">{formatarValorIndicador(indicador.meta, indicador.unidade)}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-charcoal/45">Realizado</p>
          <p className="font-semibold text-brand-dark">
            {formatarValorIndicador(indicador.realizado, indicador.unidade)}
          </p>
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-semibold text-brand-charcoal/60">Atingimento</span>
          <span className="font-bold text-brand-dark">{formatarPercentual(indicador.atingimento, 0)}</span>
        </div>
        <ProgressBar atingimento={indicador.atingimento} status={indicador.status} />
      </div>

      <div className="flex items-center justify-between border-t border-brand-beige/60 pt-3">
        <p className="text-xs text-brand-charcoal/55">
          Impacto na RV: <span className="font-bold text-brand-dark">{formatarPercentual(indicador.impactoNaRv, 1)}</span>
        </p>
        <StatusBadge status={indicador.status} />
      </div>
    </div>
  )
}
