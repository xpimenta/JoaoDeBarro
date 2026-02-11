# Handoff Receivables

Data de referencia: 2026-02-09

## Objetivo do modulo

Manter a listagem de recebiveis com visual light/minimalista, leitura rapida dos dados principais e acesso ao detalhe completo via modal, com fluxo de edicao preservado.

## O que ja foi entregue

- Listagem principal simplificada com colunas-chave.
- Acao de detalhe (`olho`) e acao de edicao (`lapis`) por linha.
- Modal completo com secoes:
  - Servico
  - Documento
  - Financeiro
  - Controle
- Edicao por rota `receivables/:id/edit` usando o mesmo formulario de criacao.
- Paleta clara do modal com contraste ajustado e alinhado ao projeto.
- Toolbar de listagem com:
  - busca textual;
  - filtro por status;
  - limpar filtros;
  - metrica de registros visiveis.
- Ordenacao nas colunas da tabela.
- Estados de tela:
  - loading;
  - erro com botao de retry;
  - vazio sem filtros;
  - vazio com filtros ativos.
- Ajustes basicos de acessibilidade:
  - labels para filtros;
  - foco visivel nas acoes;
  - `aria-live` para feedback de estado/contagem.

## Arquivos principais

- `WebApps/frontend/src/app/domains/finance/ap-ar/receivables/pages/receivables.page.ts`
- `WebApps/frontend/src/app/domains/finance/ap-ar/receivables/pages/receivables.page.html`
- `WebApps/frontend/src/app/domains/finance/ap-ar/receivables/pages/receivables.page.scss`
- `WebApps/frontend/src/styles.scss`
- `WebApps/frontend/src/assets/i18n/pt-BR.json`
- `WebApps/frontend/src/assets/i18n/en.json`
- `WebApps/frontend/src/app/domains/finance/ap-ar/receivables/data-access/receivables.api.ts`
- `WebApps/frontend/src/app/domains/finance/ap-ar/receivables/pages/receivable-create.page.ts`
- `WebApps/frontend/src/app/domains/finance/ap-ar/receivables/pages/receivable-create.page.html`
- `WebApps/frontend/src/app/app.routes.ts`

## Decisoes de UI/UX ja tomadas

- Sem caption textual fixo na tabela para manter layout mais clean.
- Paginacao so aparece quando necessario (`rows > pageSize`).
- Detalhes completos no modal para evitar poluicao visual da listagem.
- Modal sobreposto ao `body` para nao ficar preso em containers do grid/tabela.

## Pontos de atencao

- Warning de budget inicial no build ainda existe e nao foi tratado nesta etapa.
- Como o modal usa `appendTo="body"`, parte da estilizacao dele precisa ficar em `styles.scss` global.

## Checklist de QA manual (Receivables)

1. Abrir listagem e validar cards + tabela.
2. Testar busca por nome do cliente e descricao de servico.
3. Testar filtro por status e botao de limpar filtros.
4. Ordenar por pelo menos 3 colunas diferentes.
5. Abrir modal de detalhe em registros distintos e validar contraste.
6. Abrir edicao pelo lapis na linha e pelo botao no modal.
7. Simular erro de API e validar estado de erro + retry.
8. Validar mobile (filtros empilhados e modal utilizavel).

## Proximo passo alinhado

Replicar o mesmo padrao de layout/UX/estados no modulo de Payables apos congelar Receivables.
