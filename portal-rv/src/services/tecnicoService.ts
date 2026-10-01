import type { RvDataSource } from './rvDataSource'
import { mockRvDataSource } from './mock/mockRvDataSource'
import { TecnicoNaoEncontradoError, type TecnicoRvData } from '../types/rv'

/**
 * Fonte de dados ativa da aplicação. Nesta fase o portal opera 100% com
 * dados mockados. Quando a integração com o BSC estiver disponível, basta
 * criar um `bscRvDataSource` que implemente `RvDataSource` e trocar esta
 * atribuição — nenhum componente de UI precisa ser alterado.
 */
const dataSource: RvDataSource = mockRvDataSource

function validarMatricula(matricula: string) {
  const valor = matricula.trim()
  if (!valor) {
    throw new Error('Informe uma matrícula válida.')
  }
  return valor
}

/**
 * Busca os dados de RV de um técnico a partir da matrícula.
 * Lança TecnicoNaoEncontradoError quando não há correspondência.
 */
export async function buscarTecnicoPorMatricula(matricula: string): Promise<TecnicoRvData> {
  const valor = validarMatricula(matricula)
  const resultado = await dataSource.buscarPorMatricula(valor)

  if (!resultado) {
    throw new TecnicoNaoEncontradoError(valor)
  }

  return resultado
}
