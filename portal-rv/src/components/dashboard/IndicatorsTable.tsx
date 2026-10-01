import type { Indicador } from '../../types/rv'
import { formatarPercentual, formatarValorIndicador } from '../../utils/format'
import { StatusBadge } from '../ui/StatusBadge'

interface IndicatorsTableProps {
  indicadores: Indicador[]
}

export function IndicatorsTable({ indicadores }: IndicatorsTableProps) {
  return (
    <div className="scrollbar-thin overflow-x-auto rounded-2xl border border-brand-beige/60 bg-white shadow-card">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-brand-beige/60 bg-brand-cream/40 text-left">
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-brand-charcoal/60">
              Indicador
            </th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-brand-charcoal/60">
              Peso
            </th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-brand-charcoal/60">
              Meta
            </th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-brand-charcoal/60">
              Realizado
            </th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-brand-charcoal/60">
              Atingimento
            </th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-brand-charcoal/60">
              Impacto na RV
            </th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-brand-charcoal/60">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {indicadores.map((indicador, index) => (
            <tr
              key={indicador.id}
              className={`border-b border-brand-beige/40 last:border-0 ${
                index % 2 === 1 ? 'bg-brand-cream/15' : ''
              }`}
            >
              <td className="px-4 py-3 font-semibold text-brand-dark">{indicador.nome}</td>
              <td className="px-4 py-3 text-brand-charcoal/70">{indicador.peso}%</td>
              <td className="px-4 py-3 text-brand-charcoal/70">
                {formatarValorIndicador(indicador.meta, indicador.unidade)}
              </td>
              <td className="px-4 py-3 text-brand-charcoal/70">
                {formatarValorIndicador(indicador.realizado, indicador.unidade)}
              </td>
              <td className="px-4 py-3 font-semibold text-brand-dark">
                {formatarPercentual(indicador.atingimento, 0)}
              </td>
              <td className="px-4 py-3 font-semibold text-brand-dark">
                {formatarPercentual(indicador.impactoNaRv, 1)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={indicador.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
