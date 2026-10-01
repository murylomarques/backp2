import type { AlertaColisaoNome } from '../../types/consultorRv'

interface ColisaoNomeAlertProps {
  alerta: AlertaColisaoNome
  onNovaConsulta: () => void
}

export function ColisaoNomeAlert({ alerta, onNovaConsulta }: ColisaoNomeAlertProps) {
  return (
    <div className="rounded-2xl border border-brand-amber/50 bg-status-warning-bg/60 p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden>
          ⚠️
        </span>
        <div className="flex-1">
          <h2 className="text-base font-bold text-brand-dark">Não foi possível exibir os indicadores com segurança</h2>
          <p className="mt-2 text-sm text-brand-charcoal/70">{alerta.mensagem}</p>

          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-charcoal/50">
            Cidades encontradas neste nome, no período
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {alerta.cidadesEncontradas.map((cidade) => (
              <span
                key={cidade}
                className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-brand-charcoal/70 shadow-sm"
              >
                {cidade}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={onNovaConsulta}
            className="mt-6 rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-card transition hover:brightness-110"
          >
            Fazer nova consulta
          </button>
        </div>
      </div>
    </div>
  )
}
