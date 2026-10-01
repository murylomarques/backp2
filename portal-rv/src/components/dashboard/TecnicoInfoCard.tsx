import type { Tecnico } from '../../types/rv'
import { obterIniciais } from '../../utils/format'

interface TecnicoInfoCardProps {
  tecnico: Tecnico
  periodoReferencia: string
}

export function TecnicoInfoCard({ tecnico, periodoReferencia }: TecnicoInfoCardProps) {
  const campos = [
    { label: 'Supervisor', valor: tecnico.supervisor },
    { label: 'Coordenador', valor: tecnico.coordenador },
    { label: 'Regional / Cidade', valor: `${tecnico.regional} · ${tecnico.cidade}` },
    { label: 'Período de referência', valor: periodoReferencia },
  ]

  return (
    <div className="rounded-2xl border border-brand-beige/60 bg-white p-6 shadow-card sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-lg font-bold text-white">
            {obterIniciais(tecnico.nome)}
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-brand-dark sm:text-xl">{tecnico.nome}</h1>
            <p className="text-sm text-brand-charcoal/60">
              {tecnico.cargo} · Matrícula {tecnico.matricula}
            </p>
          </div>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-brand-beige/60 pt-6 sm:grid-cols-2 lg:grid-cols-4">
        {campos.map((campo) => (
          <div key={campo.label}>
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-charcoal/45">
              {campo.label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-brand-dark">{campo.valor}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
