# Modos de desenvolvimento e portas

## Objetivo
Separar os fluxos `local`, `docker-dev` e `docker-prod`, evitando conflito de porta e evitando vazar segredo no Git.

## Portas por modo

| Servico | Local (sem Docker) | Docker Dev | Docker Prod |
|---|---:|---:|---:|
| Frontend | `4200` | `14200` | `${FRONTEND_PORT}` (default `80`) |
| Receivables API | `5125` | `15125` | interno |
| Payables API | `5032` | `15032` | interno |
| SQL Server | `1433` | `11433` | interno |

## Arquivos de compose
- `docker-compose.dev.yml`
- `docker-compose.prod.yml`
- `docker-compose.yml` legado foi removido para evitar uso acidental sem `-f`.

## Seguranca de variaveis
- Arquivos reais de segredo:
  - `.env.dev`
  - `.env.prod`
- Esses arquivos estao no `.gitignore`.
- Templates versionados:
  - `.env.dev.example`
  - `.env.prod.example`

## Como rodar

### 1) Local (rapido)
- Frontend: `cd WebApps/frontend && npm start`
- Receivables API: `dotnet run --project services/receivables/src/JoaoDeBarro.Receivables.Api`
- Payables API: `dotnet run --project services/payables/JoaoDeBarro.Payables.Api`

### 2) Docker Dev
1. Criar arquivo real de variaveis: `cp .env.dev.example .env.dev`
2. Subir: `docker compose --env-file .env.dev -f docker-compose.dev.yml up -d --build`
3. URLs:
   - Frontend: `http://localhost:14200`
   - Receivables Swagger: `http://localhost:15125/swagger`
   - Payables Swagger: `http://localhost:15032/swagger`

### 3) Docker Prod (preparo)
1. Criar arquivo real de variaveis: `cp .env.prod.example .env.prod`
2. Ajustar senha e porta no `.env.prod`
3. Subir: `docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build`

## Observacoes de configuracao
- Frontend local usa `src/environments/environment.ts` (`http://localhost:5125/api/Receivables`).
- Frontend docker-dev usa `src/environments/environment.docker.ts` (`http://localhost:15125/api/Receivables`).
- Frontend production usa `src/environments/environment.production.ts` (`/api/Receivables`).
- O `nginx` do frontend em production faz proxy de `/api/*` para `receivables-api`.
- CORS das APIs permite `http://localhost:4200` e `http://localhost:14200`.
