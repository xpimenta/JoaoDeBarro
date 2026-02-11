# Refatoracao UI - Frontend JoaoDeBarro

## Objetivo
Criar uma interface **light, minimalista e moderna**, alinhada a identidade da marca (verde natural + acento quente), melhorando legibilidade, hierarquia visual e experiencia operacional.

## Base visual aplicada
- Novo design system centralizado em `src/styles.scss`.
- Tokens principais:
  - `--brand-900` a `--brand-100` (escala verde)
  - `--accent-500` e `--accent-200` (acento quente)
  - `--bg`, `--surface`, `--line`, `--ink`, `--muted` (superficies claras)
- Tipografia:
  - Titulos: `Sora`
  - Texto/interface: `Manrope`
- Componentes PrimeNG padronizados globalmente:
  - `p-table`, `p-inputtext`, `p-select`, `p-button`, `p-paginator`

## Referencias visuais (Dribbble)
- SaaS Light Dashboard  
  https://dribbble.com/shots/26186414-SaaS-light-mode-dashboard
- FluxCRM - CRM Dashboard  
  https://dribbble.com/shots/21509406-FluxCRM-CRM-Dashboard
- GreenNest - Home Dashboard  
  https://dribbble.com/shots/26165812-GreenNest-Home-Dashboard

## Principios adotados
- Menos contraste agressivo: remover fundo escuro e reduzir ruido visual.
- Cartoes leves com profundidade sutil (shadow curta + borda clara).
- Status semantico com `status-chip` para leitura rapida.
- Espacamento respirado e tipografia com escala mais consistente.
- Motion discreta (`rise-in`) para entrada de layout e secoes.

## O que ja foi refatorado
- Shell global (sidebar, topbar e responsividade).
- Dashboard (KPIs + tabelas com melhor hierarquia).
- Paginas de Recebiveis/Pagaveis (headers + tabela dentro de painel + chips).
- Formulario de novo recebivel (cards e campos refinados).
- Traducoes adicionais para novos textos (`pt-BR` e `en`).

## Evolucao recomendada (proximas sprints)
1. Extrair componentes de design system (`UiPageHeader`, `UiPanel`, `UiStatusChip`, `UiMetricCard`).
2. Criar tema tokenizado com variacoes por modulo (Finance, Ambiental, Operacoes).
3. Introduzir estados vazios, loading skeleton e toasts com padrao visual unico.
4. Revisar acessibilidade (contraste, foco visivel, navegacao por teclado, ARIA).
5. Definir estrategia de stack:
   - Curto prazo (recomendado): manter PrimeNG e aprofundar customizacao por tokens.
   - Medio prazo: migrar gradualmente para componentes headless (Angular CDK) + design system proprio.

## Observacao de marca
A paleta foi iniciada com base em tons naturais coerentes com a identidade visual da marca. Se voce me enviar o arquivo oficial da logo (ou manual de marca), consigo fechar o mapeamento com os hex exatos e gerar tokens definitivos.
