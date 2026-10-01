import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { TecnicoInfoCard } from '../components/dashboard/TecnicoInfoCard'
import { IndicatorCard } from '../components/dashboard/IndicatorCard'
import { IndicatorsTable } from '../components/dashboard/IndicatorsTable'
import { RvEvolutionChart } from '../components/dashboard/RvEvolutionChart'
import { MetaRealizadoChart } from '../components/dashboard/MetaRealizadoChart'
import { EmptyState } from '../components/ui/EmptyState'
import type { TecnicoRvData } from '../types/rv'

interface DashboardPageProps {
  data: TecnicoRvData
  onNovaConsulta: () => void
}

export function DashboardPage({ data, onNovaConsulta }: DashboardPageProps) {
  const { tecnico, resumo, indicadores, historico } = data
  const indicadoresParaMelhorar = indicadores.filter((i) => i.status !== 'meta_atingida')

  return (
    <div className="flex min-h-svh flex-col bg-[#f7f6f2]">
      <Header onNovaConsulta={onNovaConsulta} mostrarNovaConsulta />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <TecnicoInfoCard tecnico={tecnico} periodoReferencia={resumo.periodoReferencia} />

        <SummaryCards resumo={resumo} />

        {indicadoresParaMelhorar.length > 0 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-brand-amber/40 bg-status-warning-bg/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="text-lg" aria-hidden>
                💡
              </span>
              <div>
                <p className="text-sm font-bold text-brand-dark">Indicadores que precisam melhorar</p>
                <p className="text-xs text-brand-charcoal/60">
                  {indicadoresParaMelhorar.map((i) => i.nome).join(' · ')}
                </p>
              </div>
            </div>
          </div>
        )}

        <section>
          <h2 className="mb-4 text-base font-bold text-brand-dark">Indicadores da RV</h2>
          {indicadores.length === 0 ? (
            <EmptyState
              titulo="Nenhum indicador disponível"
              descricao="Ainda não há indicadores apurados para este período de referência."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {indicadores.map((indicador) => (
                <IndicatorCard key={indicador.id} indicador={indicador} />
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <RvEvolutionChart historico={historico} />
          <MetaRealizadoChart indicadores={indicadores} />
        </section>

        <section>
          <h2 className="text-base font-bold text-brand-dark">Como minha RV foi calculada?</h2>
          <p className="mb-4 mt-1 text-sm text-brand-charcoal/60">
            Cada indicador tem um peso na composição da sua RV. O percentual de atingimento de cada
            um, multiplicado pelo seu peso, define o impacto final no valor recebido.
          </p>
          <IndicatorsTable indicadores={indicadores} />
        </section>
      </main>

      <Footer />
    </div>
  )
}
