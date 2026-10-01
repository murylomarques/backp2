import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Indicador } from '../../types/rv'
import { formatarPercentual, formatarValorIndicador } from '../../utils/format'
import { statusConfig } from '../../utils/status'

interface MetaRealizadoChartProps {
  indicadores: Indicador[]
}

const MUTED_TEXT = '#8a8078'

const LEGENDA = [
  { status: 'meta_atingida' as const, label: 'Meta atingida' },
  { status: 'proximo_da_meta' as const, label: 'Próximo da meta' },
  { status: 'abaixo_da_meta' as const, label: 'Abaixo da meta' },
]

const NOMES_CURTOS: Record<string, string> = {
  csat: 'CSAT',
  sla: 'SLA',
  produtividade: 'Produtividade',
  qualidade: 'Qualidade',
  absenteismo: 'Assiduidade',
}

function abreviarNome(id: string, nome: string) {
  return NOMES_CURTOS[id] ?? (nome.length > 12 ? `${nome.slice(0, 11)}…` : nome)
}

function TooltipContent({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const item: Indicador = payload[0]?.payload
  if (!item) return null
  return (
    <div className="rounded-lg border border-brand-beige/70 bg-white px-3 py-2 text-xs shadow-card-hover">
      <p className="font-semibold text-brand-dark">{item.nome}</p>
      <p className="mt-1 text-brand-charcoal/70">
        Meta: <span className="font-bold text-brand-dark">{formatarValorIndicador(item.meta, item.unidade)}</span>
      </p>
      <p className="text-brand-charcoal/70">
        Realizado:{' '}
        <span className="font-bold text-brand-dark">
          {formatarValorIndicador(item.realizado, item.unidade)}
        </span>
      </p>
      <p className="mt-1 text-brand-charcoal/70">
        Atingimento: <span className="font-bold text-brand-dark">{formatarPercentual(item.atingimento, 0)}</span>
      </p>
    </div>
  )
}

export function MetaRealizadoChart({ indicadores }: MetaRealizadoChartProps) {
  const dados = indicadores.map((indicador) => ({
    ...indicador,
    nomeCurto: abreviarNome(indicador.id, indicador.nome),
  }))

  return (
    <div className="rounded-2xl border border-brand-beige/60 bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-brand-dark">Meta x Realizado por indicador</h3>
          <p className="mt-1 text-xs text-brand-charcoal/55">
            Percentual de atingimento de cada indicador em relação à meta (100%)
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {LEGENDA.map((item) => (
            <span key={item.status} className="flex items-center gap-1.5 text-[11px] text-brand-charcoal/60">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: statusConfig(item.status).chartColor }}
                aria-hidden
              />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e5e1cf" strokeDasharray="3 4" />
            <XAxis
              dataKey="nomeCurto"
              axisLine={false}
              tickLine={false}
              tick={{ fill: MUTED_TEXT, fontSize: 11 }}
              interval={0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={40}
              tick={{ fill: MUTED_TEXT, fontSize: 11 }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<TooltipContent />} cursor={{ fill: '#f7f6f2' }} />
            <ReferenceLine y={100} stroke="#292522" strokeDasharray="4 4" strokeOpacity={0.35} />
            <Bar
              dataKey="atingimento"
              name="Atingimento"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
              isAnimationActive={false}
            >
              {dados.map((item) => (
                <Cell key={item.id} fill={statusConfig(item.status).chartColor} />
              ))}
              <LabelList
                dataKey="atingimento"
                position="top"
                formatter={(value: unknown) => `${Math.round(Number(value))}%`}
                style={{ fill: '#292522', fontSize: 11, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
