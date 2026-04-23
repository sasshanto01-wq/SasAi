# SasAi

NEXUS TERMINAL — AI-powered multi-asset trading dashboard with deep equity research.

A React + TypeScript trading intelligence platform with an Express + OpenAI backend, providing institutional flow data, retail sentiment, market news, trade signals (BTCUSD / XAUUSD / EURUSD / USOIL), and AI-powered deep equity research for any stock ticker (live Yahoo Finance data + GPT analysis).

## Stack

- pnpm workspace monorepo (TypeScript)
- React 19 + Vite frontend (`artifacts/trading-dashboard`)
- Express 5 + OpenAI backend (`artifacts/api-server`)
- PostgreSQL + Drizzle ORM
- OpenAPI / Orval codegen for shared API types

## Run

```bash
pnpm install
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/trading-dashboard run dev
```
