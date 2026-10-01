import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { HistoricoMensal } from '../../types/rv'
import { formatarMoeda } from '../../utils/format'

interface RvEvolutionChartProps {
  historico: HistoricoMensal[]
}

const LINE_COLOR = '#ae2e2a'
const MUTED_TEXT = '#8a8078'

function formatarEixoY(valor: number) {
  const emMilhares = Math.round(valor / 100) / 10
  return `R$${emMilhares.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}k`
}

function TooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const item: HistoricoMensal = payload[0].payload
  return (
    <div className="rounded-lg border border-brand-beige/70 bg-white px-3 py-2 text-xs shadow-card-hover">
      <p className="font-semibold text-brand-dark">{label}</p>
      <p className="mt-1 text-brand-charcoal/70">
        RV: <span className="font-bold text-brand-dark">{formatarMoeda(item.valorRv)}</span>
      </p>
      <p className="text-brand-charcoal/70">Atingimento: {item.percentualAtingimento}%</p>
    </div>
  )
}

export function RvEvolutionChart({ historico }: RvEvolutionChartProps) {
  return (
    <div className="rounded-2xl border border-brand-beige/60 bg-white p-5 shadow-card sm:p-6">
      <h3 className="text-sm font-bold text-brand-dark">Evolução da RV nos últimos meses</h3>
      <p className="mt-1 text-xs text-brand-charcoal/55">Valor de RV apurado a cada competência</p>

      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={historico} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="rvFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={LINE_COLOR} stopOpacity={0.22} />
                <stop offset="100%" stopColor={LINE_COLOR} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#e5e1cf" strokeDasharray="3 4" />
            <XAxis
              dataKey="mes"
              axisLine={false}
              tickLine={false}
              tick={{ fill: MUTED_TEXT, fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={48}
              tick={{ fill: MUTED_TEXT, fontSize: 11 }}
              tickFormatter={formatarEixoY}
            />
            <Tooltip content={<TooltipContent />} cursor={{ stroke: '#cfcbbb', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="valorRv"
              stroke={LINE_COLOR}
              strokeWidth={2}
              strokeLinecap="round"
              fill="url(#rvFill)"
              dot={{ r: 3.5, fill: LINE_COLOR, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: LINE_COLOR, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
