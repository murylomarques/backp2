import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { TecnicoConsultorInfoCard } from '../components/dashboard/TecnicoConsultorInfoCard'
import { IndicadorConsultorCard } from '../components/dashboard/IndicadorConsultorCard'
import { ColisaoNomeAlert } from '../components/dashboard/ColisaoNomeAlert'
import { FaixaRvCard } from '../components/dashboard/FaixaRvCard'
import type { ConsultorRvData } from '../types/consultorRv'

interface DashboardConsultorPageProps {
  data: ConsultorRvData
  onNovaConsulta: () => void
}

export function DashboardConsultorPage({ data, onNovaConsulta }: DashboardConsultorPageProps) {
  const { tecnico, periodo, indicadores, composicaoRv, alerta, qualidadeDados } = data
  const indicadoresComRealizado = indicadores.filter((i) => i.realizado !== null).length
  const indicadoresComMeta = indicadores.filter((i) => i.meta !== null).length

  return (
    <div className="flex min-h-svh flex-col bg-[#f7f6f2]">
      <Header onNovaConsulta={onNovaConsulta} mostrarNovaConsulta />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <TecnicoConsultorInfoCard tecnico={tecnico} periodo={periodo} />

        {alerta ? (
          <ColisaoNomeAlert alerta={alerta} onNovaConsulta={onNovaConsulta} />
        ) : (
          <>
            {composicaoRv && <FaixaRvCard composicao={composicaoRv} />}

            <div className="rounded-2xl border border-brand-beige/60 bg-white px-5 py-4 text-sm text-brand-charcoal/70">
              <p>
                <strong className="text-brand-dark">{indicadoresComRealizado} de {indicadores.length}</strong>{' '}
                indicadores já têm valor real calculado a partir do BSC.
              </p>
              <p className="mt-1">
                <strong className="text-brand-dark">{indicadoresComMeta} de {indicadoresComRealizado}</strong>{' '}
                desses já têm meta oficial cadastrada (mostram Faixa de atingimento); os demais mostram o
                realizado, mas aguardam a meta oficial do Planejamento de Operações para julgar o resultado.
                Nenhum valor é estimado ou inventado.
              </p>
            </div>

            <section>
              <h2 className="mb-4 text-base font-bold text-brand-dark">Indicadores do Consultor Técnico</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {indicadores.map((indicador) => (
                  <IndicadorConsultorCard key={indicador.id} indicador={indicador} />
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-brand-beige/60 bg-white p-5 text-xs text-brand-charcoal/55 sm:p-6">
              <p className="mb-2 text-sm font-bold text-brand-dark">Transparência dos dados</p>
              <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                <li>Ordens de serviço concluídas no período: {qualidadeDados.totalOsConcluidas}</li>
                {qualidadeDados.osComPuMapeado !== undefined && (
                  <li>OS com peso PU mapeado: {qualidadeDados.osComPuMapeado}</li>
                )}
                {qualidadeDados.osSemPuMapeado !== undefined && qualidadeDados.osSemPuMapeado > 0 && (
                  <li>OS sem peso PU mapeado (não entraram na soma): {qualidadeDados.osSemPuMapeado}</li>
                )}
                <li>Linhas duplicadas removidas na origem: {qualidadeDados.linhasDuplicadasRemovidas}</li>
                <li>
                  Território com meta cadastrada: {qualidadeDados.territorioTemMetaCadastrada ? 'Sim' : 'Não'}
                </li>
              </ul>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
