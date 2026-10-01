# Limitações conhecidas — piloto Consultor Técnico

Este documento existe para que o próximo passo da integração não repita a investigação
feita para chegar até aqui. Tudo listado abaixo foi validado contra o banco real
(`dbplanp02.VIEW_BSC`), não é suposição.

## O que já funciona com dado 100% real

- Busca de técnico por nome (autocomplete), com dados de `VIEW_BSC`.
- Indicador **Produtividade (PU)**: soma de PU por ordem de serviço concluída (usando a
  tabela de pesos do Book de RV, Quadro 1), dividida pelos dias realmente trabalhados no
  período, comparada com a meta oficial do território (quando cadastrada).
- Indicador **IRR**: % de reparos concluídos com `Flag_IRR='1'` sobre o total de reparos do
  técnico no período, comparado com a meta oficial (8,3% — set/2026, quanto menor melhor).
- Indicador **IFI**: % de ativações concluídas com `Flag_IFI='1'` sobre o total de ativações
  do técnico no período (fica sem base quando o técnico não fez nenhuma ativação no mês),
  comparado com a meta oficial (3,5% — set/2026, quanto menor melhor).
- Indicador **CA REP**: % de reparos com `Flag_AG='1'` (cumprimento de agenda) sobre os
  reparos com esse flag preenchido.
- **IRT foi removido do dashboard** (a pedido do usuário) — a estimativa individual ficava
  muito distante do número oficial (63% vs. teto oficial de ~4,3%) e gerava confusão. Fica
  registrado aqui como referência caso a base de "Acessos" apareça no futuro.
- Deduplicação de OS repetidas na view.
- Detecção de colisão de nome (bloqueia exibição em vez de misturar dados de pessoas
  diferentes).
- Tratamento de indisponibilidade temporária da `VIEW_BSC` (janelas de recarga no banco).

## Status dos 4 indicadores exibidos (Consultor Técnico)

O Consultor Técnico tem 5 indicadores no Book (CA REP, IRR, IFI, IRT, Produtividade); o
dashboard hoje mostra 4 (IRT foi removido, ver acima). Todos os 4 já têm **realizado**
calculado com dado real, e 3 já têm **meta oficial** aplicada (mostram Faixa de atingimento):

| Indicador | Realizado | Meta oficial |
|---|---|---|
| Produtividade (PU) | ✅ Real | ✅ Cadastrada (9 territórios) |
| IRR (Índice de Reparo Repetido) | ✅ Real | ✅ Cadastrada (8,3% — global, set/2026) |
| IFI (Índice de Falha na Instalação) | ✅ Real (quando há ativação no período) | ✅ Cadastrada (3,5% — global, set/2026) |
| CA REP (Conclusão de Agenda — Reparo) | ✅ Real | ✅ Cadastrada (87% — global, set/2026; é o "Cumprimento de Primeira Agenda" de Reparos na planilha de metas) |

**Os 4 indicadores exibidos estão completos** (realizado + meta oficial). Metas recebidas mas
ainda não usadas (fora do escopo do Consultor Técnico ou de outros papéis): V-INST, V-REP,
V-MUD (velocidade), Outliers de Reparo/Mud End, APP CLIENTE, Retiradas de Equipamentos.

IRR e IFI usam meta **global** (não varia por território, ao contrário de Produtividade) e
são indicadores "quanto menor melhor" — o atingimento é calculado como `meta ÷ realizado`
(realizado menor que a meta = atingimento acima de 100%).

## Faixa final (0-3) — implementada em `server/faixaConsultor.js`

Com os 4 indicadores completos, o dashboard agora mostra a **Faixa de atingimento** (seção
"Como minha RV foi calculada"), reconstruindo a régua de pontos exata do Book: Tolerável =
50% do peso, Meta = 100%, Superação = 110% (teto), interpolação linear entre esses pontos,
abaixo do Tolerável = 0. Peso total do Consultor Técnico = 10,0 (CA REP 3,5 + IRR 3,0 + IFI
0,5 + IRT 1,0 + Produtividade 2,0), escala 0-11, faixas conforme Book (0–4,9 / 5–7,5 /
7,6–10 / 10,1–11).

**Decisão confirmada com o usuário**: indicador sem dado no período OU sem meta oficial
entra como **neutro** (100% do peso) na soma — não penaliza nem beneficia o técnico pela
ausência de dado. Isso inclui o IRT, que nunca é medido (sem fonte de "Acessos") e sempre
entra neutro com seu peso de 1,0.

**Isso NÃO é a Faixa oficial final.** Ainda faltam, do Book, seções não implementadas:
- Escolha entre Modelo Produtividade/Qualidade (depende do IRT trimestral do território, que
  não conseguimos medir).
- Deflator por IRT (reduz a faixa de todo o território se o IRT mensal estourar o limite).
- Regras de elegibilidade (recém-contratados, afastamento, férias).
- Conversão de Faixa em R$/% de RV (tabela "parametrização interna por cargo", não recebida).

O card no dashboard deixa esse aviso explícito para quem for usar o número.

## Riscos e decisões que precisam de validação humana

1. **Colisão de nome é comprovada, não teórica.** Testamos com "Karina Silva Rodrigues":
   1.500 OS em 27 cidades no mesmo mês, atribuídas a um único login. O limiar atual
   (>400 OS/mês **e** >10 cidades distintas) é uma calibração inicial baseada em poucos
   exemplos reais — vale revisar com mais amostras antes de confiar cegamente.
2. **Números de Produtividade muito altos merecem checagem humana.** Em um dos técnicos
   testados (Sorocaba), a média diária deu ~370% de atingimento — não estourou o limiar de
   colisão, mas é alto o suficiente para valer uma conferência manual contra a realidade.
3. **Mapeamento de PU por tipo de serviço** cobre ~96% do volume observado (Reparo,
   Ativação, Retirada, Mudança de Endereço, Entrega de Chip). O restante (variações de
   "Outros Serviços" como alteração de plano, migração entre empresas etc.) fica de fora da
   soma — não é erro, é para não inventar peso, mas reduz um pouco a Produtividade real de
   quem tem muito desse tipo de serviço.
4. **Território do técnico** é inferido pela cidade mais frequente nas OS do mês. Só 9
   territórios (das dezenas de cidades que aparecem na `VIEW_BSC`) têm meta cadastrada hoje
   (os que vieram na planilha do Planejamento de Operações). Os demais mostram o realizado
   sem meta comparável.
5. **Cadastro do técnico** (cargo, Próprio/Terceiro/Híbrido, supervisor, coordenador) ainda
   não está integrado — o dashboard mostra "aguardando integração de cadastro". Sem isso,
   também não dá para saber qual dos outros 8 conjuntos de indicadores do Book (Supervisor,
   Coordenador, Gerente × Próprio/Terceiro/Híbrido) aplicar a cada pessoa.
6. **Não há tabela de conversão de Faixa (0-3) em R$/%.** O Book cita isso como
   "parametrização interna por cargo" — mesmo com os 5 indicadores completos, ainda faltaria
   essa tabela para mostrar a Faixa final (o portal está preparado para mostrar a Faixa, não
   o valor em R$, conforme pedido).

## Arquitetura

O frontend (`src/`) **nunca** fala com o MySQL diretamente — só com a API em `server/`,
que segura as credenciais do banco. Isso é obrigatório: um app de navegador não pode manter
uma credencial de banco de produção em segurança.
