import { useCallback, useState } from 'react'
import { buscarRvConsultor, BscIndisponivelError, TecnicoSemDadosError } from '../services/bsc/bscApiClient'
import type { ConsultorRvData } from '../types/consultorRv'

type ConsultorRvStatus = 'idle' | 'loading' | 'success' | 'error'

interface ConsultorRvState {
  status: ConsultorRvStatus
  data: ConsultorRvData | null
  errorMessage: string | null
}

export function useConsultorRv() {
  const [state, setState] = useState<ConsultorRvState>({
    status: 'idle',
    data: null,
    errorMessage: null,
  })

  const consultar = useCallback(async (nomeTecnico: string, periodo: string) => {
    setState({ status: 'loading', data: null, errorMessage: null })
    try {
      const data = await buscarRvConsultor(nomeTecnico, periodo)
      setState({ status: 'success', data, errorMessage: null })
    } catch (error) {
      const mensagem =
        error instanceof TecnicoSemDadosError || error instanceof BscIndisponivelError
          ? error.message
          : 'Não foi possível concluir a consulta agora. Tente novamente em instantes.'
      setState({ status: 'error', data: null, errorMessage: mensagem })
    }
  }, [])

  const resetar = useCallback(() => {
    setState({ status: 'idle', data: null, errorMessage: null })
  }, [])

  return { ...state, consultar, resetar }
}
