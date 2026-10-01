# Portal RV — Desktop

Portal de Acompanhamento de Remuneração Variável (RV) para os técnicos de campo da Desktop.
O técnico busca seu nome e acessa um dashboard individual com os indicadores apurados a
partir do BSC (`VIEW_BSC`, banco `dbplanp02`).

**Status atual: piloto do perfil Consultor Técnico.** Só o indicador **Produtividade (PU)**
está calculado ponta a ponta com dado real e meta oficial. Os demais indicadores do modelo
(IRR, IFI, IRT, CA REP) aparecem como "aguardando fonte de dados" — não são estimados.
Veja `LIMITACOES.md` para o detalhe completo do que falta e por quê.

## Rodando o projeto

O portal tem duas partes que precisam rodar ao mesmo tempo: a API (`server/`) e o
frontend (`src/`).

```bash
# 1. Configure as credenciais do BSC
cp .env.example .env
# edite .env com MYSQL_ORIGEM_HOST / PORT / DATABASE / USER / PASSWORD

# 2. Suba a API (porta 3001)
cd server
npm install
npm start

# 3. Em outro terminal, suba o frontend (porta 5173)
cd ..
npm install
npm run dev
```

Na busca, digite ao menos 3 letras de um nome de técnico real (ex: `VINICIUS`, `GILDESIO`)
e escolha um período (mês) que já tenha ordens de serviço fechadas.

## Estrutura

```
server/                 API (Express) — única camada que fala com o MySQL do BSC
  db.js                 Pool de conexão (lê credenciais do .env)
  puTable.js             Tabela de PU (Quadro 1 do Book de RV) e função de mapeamento
  territorios.js          Metas de Produtividade/IRT por território (Planejamento de Operações)
  rvConsultorService.js  Regra de negócio: busca por nome, dedupe, detecção de colisão, cálculo
  index.js               Rotas HTTP

src/
  components/
    layout/       Header, Footer
    search/       Autocomplete de busca por nome + seletor de período
    dashboard/     Cards do técnico, do indicador, alerta de colisão de nome
    ui/            Componentes genéricos (badge, progress bar, skeleton, estados vazio/erro)
  pages/           SearchPage, DashboardSkeletonPage, DashboardConsultorPage
  hooks/           useConsultorRv — orquestra o fluxo de consulta (idle/loading/success/error)
  services/
    bsc/bscApiClient.ts   Cliente HTTP da API real (busca por nome, RV do consultor)
    mock/, rvDataSource.ts, tecnicoService.ts   Camada de mock original (matrícula fictícia),
                                                mantida no repo mas não usada pelo App atual
  types/           consultorRv.ts (dados reais) e rv.ts (modelos do protótipo mock)
  utils/           Formatação (moeda, percentual) e mapeamento de status
```

## Decisões importantes tomadas durante a integração

- **Identificação por nome, não por matrícula**: a `VIEW_BSC` não tem um campo de matrícula
  numérica, só `LOGIN_TECNICO` (nome). Nomes podem colidir entre pessoas reais diferentes —
  o backend detecta isso (muitas cidades + volume implausível no mesmo mês) e bloqueia a
  exibição de números em vez de misturar dados de gente diferente.
- **Deduplicação por OS**: a `VIEW_BSC` pode repetir a mesma ordem de serviço em várias linhas
  (join com outras tabelas). O backend deduplica por `ID_OSS`+`ID_ATENDIMENTO`, no mesmo
  padrão já usado em `load_view_bsc.py` na raiz do projeto.
- **Produtividade é uma média diária**, não a soma do mês — a meta oficial (ex: 2,6 PU) só
  faz sentido comparada com `soma de PU ÷ dias efetivamente trabalhados` (via `DT_FECHAMENTO`,
  não `PERIODO_FECHAMENTO`, que é só o mês de competência).
- **`VIEW_BSC` pode ficar temporariamente vazia** para o período mais recente durante janelas
  de recarga no banco de origem. A API devolve erro 503 nesse caso em vez de um dashboard
  vazio/quebrado.
