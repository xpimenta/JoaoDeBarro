# Checklist de Retomada

Use este roteiro quando reabrir o projeto e quiser continuar do ponto atual.

## 1) Preparar ambiente

```bash
cd /Users/xpimenta/RiderProjects/JoaoDeBarro
git status --short
```

## 2) Ler contexto salvo

- `docs/context/CURRENT_STATE.md`
- `docs/context/RECEIVABLES_HANDOFF.md`
- `docs/context/WORKLOG_RECEIVABLES.md`

## 3) Validar front-end rapido

```bash
cd WebApps/frontend
npm install
npm run build
```

## 4) Subir ambiente docker dev (quando necessario)

```bash
cd /Users/xpimenta/RiderProjects/JoaoDeBarro
docker compose --env-file .env.dev -f docker-compose.dev.yml up -d --build
```

## 5) Prompt de retomada sugerido para o agente

```text
Continue a partir de docs/context/RECEIVABLES_HANDOFF.md.
Mantenha o padrao visual do Receivables e avance no item: <descrever item>.
```

## 6) Encerrar sessao sem perder trabalho

Opcao A: commit de checkpoint

```bash
git add .
git commit -m "WIP: checkpoint contexto sessao"
```

Opcao B: stash nomeado

```bash
git stash push -u -m "wip contexto sessao"
```
