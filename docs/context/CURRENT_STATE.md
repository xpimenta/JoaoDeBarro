# Estado Atual do Projeto

Data de referencia: 2026-02-09

## Escopo em andamento

- Separacao de `docker-compose` por ambiente (`dev` e `prod`).
- Ajustes de CORS/HTTPS em APIs (`payables` e `receivables`).
- Refatoracao visual e funcional do front-end, com foco no modulo de Receivables.

## Snapshot tecnico

- Branch atual: validar com `git branch --show-current`.
- Working tree esta sujo com alteracoes em:
  - `WebApps/frontend` (layout, i18n, modal, filtros, estados de tela).
  - `services/payables` e `services/receivables` (Program.cs, Dockerfile).
  - arquivos de compose/env e documentacao de portas.

## Itens importantes para nao perder

- O modal de detalhes de Receivables usa `appendTo="body"` e estilo global para manter contraste correto.
- A listagem de Receivables ja tem:
  - busca textual;
  - filtro por status;
  - ordenacao por colunas;
  - estados de loading/erro/vazio;
  - acessibilidade basica (`aria-label`, foco visivel, `aria-live`).
- Build do front-end passa; warning de budget inicial ainda existe.

## Validacao rapida

```bash
cd WebApps/frontend
npm run build
```

## Proximo foco sugerido

1. Fechamento final visual de Receivables (microajustes se necessario).
2. Replicar padrao para Payables.
3. Revisao final de docker dev/prod e documentacao de deploy local.
