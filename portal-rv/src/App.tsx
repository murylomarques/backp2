import { useConsultorRv } from './hooks/useConsultorRv'
import { SearchPage } from './pages/SearchPage'
import { DashboardSkeletonPage } from './pages/DashboardSkeletonPage'
import { DashboardConsultorPage } from './pages/DashboardConsultorPage'

function periodoAnteriorPadrao(): string {
  const agora = new Date()
  const anoMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1)
  const ano = anoMesAnterior.getFullYear()
  const mes = String(anoMesAnterior.getMonth() + 1).padStart(2, '0')
  return `${ano}-${mes}`
}

function App() {
  const { status, data, errorMessage, consultar, resetar } = useConsultorRv()

  if (status === 'loading') {
    return <DashboardSkeletonPage />
  }

  if (status === 'success' && data) {
    return <DashboardConsultorPage data={data} onNovaConsulta={resetar} />
  }

  return (
    <SearchPage
      errorMessage={status === 'error' ? errorMessage : null}
      periodoPadrao={periodoAnteriorPadrao()}
      onSubmit={consultar}
      onRetry={resetar}
    />
  )
}

export default App
