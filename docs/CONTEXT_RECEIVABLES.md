# Contexto de Trabalho - Receivables

Atualizado em: 2026-02-10

## Como reutilizar este contexto

No início de uma nova sessão, peça:

- "Leia `docs/CONTEXT_RECEIVABLES.md` e continue do item X."

Isso reduz perda de contexto entre conversas.

## Objetivo do fluxo

Evoluir a tela de recebíveis para substituir o uso manual de Excel:

- mais automação de datas e valores;
- suporte real a parcelamento;
- regras tributárias claras (ISS e INSS);
- feedback de erro claro ao salvar.

## Decisões já implementadas

### 1) Parcelamento gera múltiplos registros

- Front envia lista de parcelas em lote.
- Backend persiste lote de uma vez.

Detalhes técnicos:

- Endpoint: `POST /api/receivables/batch`
- Arquivo: `services/receivables/src/JoaoDeBarro.Receivables.Api/Controllers/ReceivablesController.cs`
- Serviço: `services/receivables/src/JoaoDeBarro.Receivables.Application/Services/ReceivableAppService.cs`

### 2) INSS incluído ponta a ponta

- Campo `InssAmount` no DTO/domínio/mapeamento/validação/EF/frontend.
- `NetAmount = Gross - ISS - INSS`.
- Regra de validação: `ISS + INSS <= Gross`.

Migração EF:

- `20260210132000_AddInssAmountToReceivables`
- Arquivo: `services/receivables/src/JoaoDeBarro.Receivables.Infrastructure/Migrations/20260210132000_AddInssAmountToReceivables.cs`

### 3) Regra tributária nas parcelas

- Se houver ISS/INSS, valor integral de imposto fica na 1a parcela.
- Demais parcelas ficam com ISS/INSS = 0.

Arquivo principal:

- `WebApps/frontend/src/app/domains/finance/ap-ar/receivables/pages/receivable-form/receivable-form.page.ts`

### 4) UX de campos obrigatórios

- Indicação com `*` vermelho em campos obrigatórios.
- Texto de apoio de obrigatoriedade mantido.

### 5) Data de pagamento sem default "hoje"

- Se houver dado do banco, exibe; senão, fica em branco.

### 6) Datas e valores das parcelas editáveis

- Sistema gera referência automática.
- Usuário pode ajustar manualmente datas e valores por parcela.

### 7) Erro ao salvar quando API estiver fora

Antes: falhava sem mensagem.

Agora:

- exibe banner de erro no formulário;
- trata API offline (`status 0`) com mensagem específica;
- tenta mostrar detalhe retornado pela API quando disponível.

Arquivos:

- `WebApps/frontend/src/app/domains/finance/ap-ar/receivables/pages/receivable-form/receivable-form.page.ts`
- `WebApps/frontend/src/app/domains/finance/ap-ar/receivables/pages/receivable-form/receivable-form.page.html`
- `WebApps/frontend/src/app/domains/finance/ap-ar/receivables/pages/receivable-form/receivable-form.page.scss`
- `WebApps/frontend/src/assets/i18n/pt-BR.json`
- `WebApps/frontend/src/assets/i18n/en.json`

## Estado atual conhecido

- Front build: ok (com warnings de budget).
- Migração de INSS: aplicada no banco de desenvolvimento durante esta sessão.

## Próximos passos sugeridos

1. Validar cenário real com 4 parcelas e confirmar 4 registros persistidos.
2. Revisar distribuição de arredondamento de valores por parcela em casos limite.
3. Opcional: padronizar tratamento de erro HTTP com interceptor global.
4. Opcional: adicionar testes automatizados para:
   - geração de parcelas;
   - regra ISS/INSS na 1a parcela;
   - payload de batch.

## Checklist rápido para retomada

- Subir API de receivables.
- Abrir tela de novo recebível.
- Testar:
  - lançamento único;
  - parcelado com edições manuais;
  - API desligada (mensagem de erro visível);
  - ISS/INSS combinados.
