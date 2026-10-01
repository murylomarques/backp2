import type { TecnicoRvData } from '../types/rv'

/**
 * Contrato de origem de dados de RV. Qualquer fonte (mock, BSC, outro ERP)
 * deve implementar esta interface para ser consumida pelo tecnicoService,
 * sem que a camada de UI precise conhecer a origem real dos dados.
 */
export interface RvDataSource {
  buscarPorMatricula(matricula: string): Promise<TecnicoRvData | null>
}
