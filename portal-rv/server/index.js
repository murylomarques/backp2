import express from 'express'
import cors from 'cors'
import { buscarTecnicosPorNome, buscarRvConsultor } from './rvConsultorService.js'

const app = express()
const PORTA = process.env.PORT || 3001

app.use(cors())

app.get('/api/tecnicos/buscar', async (req, res) => {
  const termo = String(req.query.q ?? '')
  try {
    const resultados = await buscarTecnicosPorNome(termo)
    res.json({ resultados })
  } catch (erro) {
    console.error('Erro ao buscar técnicos:', erro.message)
    res.status(503).json({
      erro: 'BSC_INDISPONIVEL',
      mensagem: 'Não foi possível consultar o BSC agora. Tente novamente em instantes.',
    })
  }
})

app.get('/api/tecnicos/:login/rv', async (req, res) => {
  const { login } = req.params
  const periodo = String(req.query.periodo ?? '')

  if (!/^\d{4}-\d{2}$/.test(periodo)) {
    res.status(400).json({ erro: 'PERIODO_INVALIDO', mensagem: 'Informe o período no formato AAAA-MM.' })
    return
  }

  try {
    const dados = await buscarRvConsultor(login, periodo)
    if (!dados) {
      res.status(404).json({
        erro: 'TECNICO_SEM_DADOS',
        mensagem: 'Não encontramos ordens de serviço para este técnico no período informado.',
      })
      return
    }
    res.json(dados)
  } catch (erro) {
    console.error('Erro ao calcular RV do consultor:', erro.message)
    res.status(503).json({
      erro: 'BSC_INDISPONIVEL',
      mensagem: 'O BSC está temporariamente indisponível (pode estar em janela de atualização). Tente novamente em instantes.',
    })
  }
})

app.listen(PORTA, () => {
  console.log(`API do Portal RV rodando em http://localhost:${PORTA}`)
})
