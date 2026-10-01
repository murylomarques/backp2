import type { RvDataSource } from '../rvDataSource'
import { MOCK_TECNICOS } from './mockData'

const SIMULATED_LATENCY_MS = 700

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Implementação de desenvolvimento do RvDataSource, com dados fictícios.
 * Simula latência de rede para reproduzir a experiência real de consulta.
 */
export const mockRvDataSource: RvDataSource = {
  async buscarPorMatricula(matricula: string) {
    await delay(SIMULATED_LATENCY_MS)
    const chave = matricula.trim()
    return MOCK_TECNICOS[chave] ?? null
  },
}
