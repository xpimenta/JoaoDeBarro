# Worklog - Receivables

Historico incremental de mudancas no modulo de Receivables.

## Regras de uso

- Sempre adicionar nova entrada no topo.
- Descrever o que mudou, arquivos-chave e validacao.
- Manter texto curto, objetivo e orientado a retomada.

---

## 2026-02-10 17:10 - Tratamento de erro ao salvar com API fora

### Mudancas

- Adicionado feedback visual de erro no formulario de Receivables.
- Tratamento explicito para API indisponivel (`HTTP status = 0`).
- Fallback para erro generico e exibicao de detalhe quando a API retorna mensagem.

### Arquivos principais

- `WebApps/frontend/src/app/domains/finance/ap-ar/receivables/pages/receivable-form/receivable-form.page.ts`
- `WebApps/frontend/src/app/domains/finance/ap-ar/receivables/pages/receivable-form/receivable-form.page.html`
- `WebApps/frontend/src/app/domains/finance/ap-ar/receivables/pages/receivable-form/receivable-form.page.scss`
- `WebApps/frontend/src/assets/i18n/pt-BR.json`
- `WebApps/frontend/src/assets/i18n/en.json`

### Validacao

- `cd WebApps/frontend && npm run build` concluido com sucesso.
- Warnings de budget permanecem (ja existentes).

---

## 2026-02-10 16:20 - Parcelamento em lote e INSS ponta a ponta

### Mudancas

- Criado endpoint batch para criacao de multiplos recebiveis em uma unica requisicao.
- Front de parcelamento passou a usar `createBatch` em vez de criar item a item.
- Adicionado `INSS` em DTO, dominio, validacao, mapeamento EF e UI.
- Regra de parcelas: ISS e INSS integrais na primeira parcela; demais parcelas com imposto zero.

### Arquivos principais

- `services/receivables/src/JoaoDeBarro.Receivables.Api/Controllers/ReceivablesController.cs`
- `services/receivables/src/JoaoDeBarro.Receivables.Application/Services/ReceivableAppService.cs`
- `services/receivables/src/JoaoDeBarro.Receivables.Domain/Entities/Receivable.cs`
- `services/receivables/src/JoaoDeBarro.Receivables.Infrastructure/Mappings/ReceivableMapping.cs`
- `services/receivables/src/JoaoDeBarro.Receivables.Infrastructure/Migrations/20260210132000_AddInssAmountToReceivables.cs`
- `WebApps/frontend/src/app/domains/finance/ap-ar/receivables/pages/receivable-form/receivable-form.page.ts`
- `WebApps/frontend/src/app/domains/finance/ap-ar/receivables/data-access/receivables.api.ts`

### Validacao

- `dotnet ef migrations list ...` confirmou migracao de INSS.
- `dotnet ef database update ...` aplicado para `AddInssAmountToReceivables`.
- `cd WebApps/frontend && npm run build` concluido com sucesso.

