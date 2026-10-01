import type { TecnicoResumo } from '../../types/consultorRv'
import { obterIniciais } from '../../utils/format'

interface TecnicoConsultorInfoCardProps {
  tecnico: TecnicoResumo
  periodo: string
}

function formatarPeriodo(periodo: string) {
  const [ano, mes] = periodo.split('-')
  const nomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  const indice = Number(mes) - 1
  return `${nomes[indice] ?? mes}/${ano}`
}

export function TecnicoConsultorInfoCard({ tecnico, periodo }: TecnicoConsultorInfoCardProps) {
  const campos = [
    { label: 'Cidade', valor: tecnico.cidade ?? '—' },
    { label: 'Regional', valor: tecnico.regional ?? '—' },
    { label: 'Período de referência', valor: formatarPeriodo(periodo) },
    { label: 'Cargo / Supervisor / Coordenador', valor: 'Aguardando integração de cadastro' },
  ]

  return (
    <div className="rounded-2xl border border-brand-beige/60 bg-white p-6 shadow-card sm:p-8">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-lg font-bold text-white">
          {obterIniciais(tecnico.nome)}
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-brand-dark sm:text-xl">{tecnico.nome}</h1>
          <p className="text-sm text-brand-charcoal/60">Consultor Técnico · dados apurados do BSC</p>
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
