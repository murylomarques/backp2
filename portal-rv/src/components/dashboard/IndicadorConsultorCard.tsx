import type { IndicadorConsultor } from '../../types/consultorRv'
import { formatarNumero, formatarPercentual } from '../../utils/format'
import { ProgressBar } from '../ui/ProgressBar'
import { StatusBadge } from '../ui/StatusBadge'

interface IndicadorConsultorCardProps {
  indicador: IndicadorConsultor
}

function formatarValor(valor: number, unidade: 'numero' | 'percentual') {
  return unidade === 'percentual' ? formatarPercentual(valor, 1) : formatarNumero(valor, 2)
}

export function IndicadorConsultorCard({ indicador }: IndicadorConsultorCardProps) {
  const semDado = indicador.realizado === null
  const semMeta = !semDado && indicador.meta === null

  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border p-5 shadow-card transition ${
        semDado
          ? 'border-dashed border-brand-beige bg-white/60'
          : 'border-brand-beige/60 bg-white hover:shadow-card-hover'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-bold text-brand-dark">{indicador.nome}</h3>
        <span className="shrink-0 rounded-full bg-brand-cream px-2 py-1 text-[11px] font-semibold text-brand-charcoal/70">
          Peso {formatarNumero(indicador.peso, 2)}
        </span>
      </div>

      {semDado && (
        <div className="flex flex-1 flex-col items-start justify-center gap-2 py-2">
          <StatusBadge status="pendente" />
          <p className="text-xs text-brand-charcoal/55">
            {indicador.observacao ??
              'Ainda não há fonte de dados confirmada para este indicador no BSC.'}
          </p>
        </div>
      )}

      {!semDado && semMeta && (
        <div className="flex flex-1 flex-col gap-2 py-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-charcoal/45">Realizado</p>
          <p className="text-2xl font-extrabold text-brand-dark">
            {formatarValor(indicador.realizado!, indicador.unidade)}
          </p>
          {indicador.observacao ? (
            <p className="text-xs text-brand-charcoal/50">{indicador.observacao}</p>
          ) : (
            indicador.baseCalculo !== undefined && (
              <p className="text-xs text-brand-charcoal/50">Calculado sobre {indicador.baseCalculo} O.S.</p>
            )
          )}
          <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-status-warning-bg px-2.5 py-1 text-xs font-semibold text-status-warning">
            Meta oficial ainda não definida
          </span>
        </div>
      )}

      {!semDado && !semMeta && (
        <>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-charcoal/45">Tolerável</p>
              <p className="font-semibold text-brand-dark">
                {formatarValor(indicador.tolerável ?? 0, indicador.unidade)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-charcoal/45">Meta</p>
              <p className="font-semibold text-brand-dark">
                {formatarValor(indicador.meta ?? 0, indicador.unidade)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-charcoal/45">Superação</p>
              <p className="font-semibold text-brand-dark">
                {formatarValor(indicador.superação ?? 0, indicador.unidade)}
              </p>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-brand-charcoal/60">
                Realizado{indicador.unidade === 'numero' ? ' (média/dia)' : ''}:{' '}
                {formatarValor(indicador.realizado ?? 0, indicador.unidade)}
              </span>
              <span className="font-bold text-brand-dark">
                {formatarPercentual(indicador.atingimento ?? 0, 0)}
              </span>
            </div>
            <ProgressBar
              atingimento={Math.min(indicador.atingimento ?? 0, 150)}
              status={indicador.status}
            />
          </div>

          {indicador.realizadoTotalNoMes !== undefined ? (
            <p className="text-xs text-brand-charcoal/50">
              Total no mês: {formatarNumero(indicador.realizadoTotalNoMes, 2)} PU em{' '}
              {indicador.diasTrabalhados} dias trabalhados
            </p>
          ) : (
            indicador.baseCalculo !== undefined && (
              <p className="text-xs text-brand-charcoal/50">Calculado sobre {indicador.baseCalculo} O.S.</p>
            )
          )}

          <div className="flex items-center justify-end border-t border-brand-beige/60 pt-3">
            <StatusBadge status={indicador.status} />
          </div>
        </>
      )}
    </div>
  )
}
