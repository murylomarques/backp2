import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { ConsultaConsultorForm } from '../components/search/ConsultaConsultorForm'
import { ErrorState } from '../components/ui/ErrorState'

interface SearchPageProps {
  errorMessage: string | null
  periodoPadrao: string
  onSubmit: (nomeTecnico: string, periodo: string) => void
  onRetry: () => void
}

const DESTAQUES = [
  { titulo: 'Indicadores em tempo real', descricao: 'Acompanhe o atingimento de cada meta que compõe a sua RV.' },
  { titulo: 'Transparência total', descricao: 'Entenda exatamente como o valor da sua RV foi calculado.' },
  { titulo: 'Histórico mensal', descricao: 'Veja a evolução da sua remuneração variável mês a mês.' },
]

export function SearchPage({ errorMessage, periodoPadrao, onSubmit, onRetry }: SearchPageProps) {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />

      <main className="flex flex-1 flex-col">
        <section className="bg-hero-gradient">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="text-white">
                <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-gold">
                  Remuneração Variável
                </span>
                <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                  Acompanhe sua RV de forma clara e transparente
                </h1>
                <p className="mt-4 max-w-md text-base text-white/80">
                  Busque pelo seu nome e veja seus indicadores apurados diretamente do BSC.
                </p>

                <dl className="mt-10 grid gap-6 sm:grid-cols-3">
                  {DESTAQUES.map((item) => (
                    <div key={item.titulo}>
                      <dt className="text-sm font-semibold text-brand-gold">{item.titulo}</dt>
                      <dd className="mt-1 text-xs text-white/70">{item.descricao}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-card-hover sm:p-8">
                {errorMessage ? (
                  <ErrorState mensagem={errorMessage} onTentarNovamente={onRetry} />
                ) : (
                  <>
                    <h2 className="text-lg font-bold text-brand-dark">Consultar minha RV</h2>
                    <p className="mt-1 text-sm text-brand-charcoal/60">
                      Digite seu nome para acessar seu dashboard individual.
                    </p>
                    <div className="mt-6">
                      <ConsultaConsultorForm periodoPadrao={periodoPadrao} onSubmit={onSubmit} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
