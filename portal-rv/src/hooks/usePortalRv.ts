import { useCallback, useState } from 'react'
import { buscarTecnicoPorMatricula } from '../services/tecnicoService'
import { TecnicoNaoEncontradoError, type TecnicoRvData } from '../types/rv'

type PortalStatus = 'idle' | 'loading' | 'success' | 'error'

interface PortalState {
  status: PortalStatus
  data: TecnicoRvData | null
  errorMessage: string | null
}

export function usePortalRv() {
  const [state, setState] = useState<PortalState>({
    status: 'idle',
    data: null,
    errorMessage: null,
  })

  const consultar = useCallback(async (matricula: string) => {
    setState({ status: 'loading', data: null, errorMessage: null })
    try {
      const data = await buscarTecnicoPorMatricula(matricula)
      setState({ status: 'success', data, errorMessage: null })
    } catch (error) {
      const mensagem =
        error instanceof TecnicoNaoEncontradoError
          ? 'Não encontramos nenhum técnico com essa matrícula. Verifique o número e tente novamente.'
          : 'Não foi possível concluir a consulta agora. Tente novamente em instantes.'
      setState({ status: 'error', data: null, errorMessage: mensagem })
    }
  }, [])

  const resetar = useCallback(() => {
    setState({ status: 'idle', data: null, errorMessage: null })
  }, [])

  return { ...state, consultar, resetar }
}
