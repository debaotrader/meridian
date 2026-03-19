# Meridian — Plano de Fases

## Phase 1 ✅ — Scaffold + Structure
- Next.js 15 + React 19 project criado
- Tailwind config com design tokens customizados
- 17 componentes MC movidos para `src/components/kanban/`
- Build passando

## Phase 2 ✅ — WsProvider + Gateway Integration
- event-parser, mock-adapter, openclaw-adapter (protocolo v3)
- ws-provider.tsx — React context com handshake + reconnect exponencial
- use-gateway.ts — hook re-export
- office-store.ts — Zustand + Immer store (agents state, feedEvent)
- ConnectionStatus.tsx — indicador visual de conexão
- ClientProviders.tsx — wrapper client-side para WsProvider no layout server
- Gateway real: challenge → connect → hello-ok → event stream
- Auth via token (mode: backend)

## Phase 3 ✅ — Kanban Module Visual Redesign
- TODOS os tokens genéricos substituídos pelos tokens customizados do design system
- KanbanView.tsx — layout composto (MissionQueue + PlanningTab + LiveFeed)
- Zero lógica alterada, apenas visual

## Phase 4 ✅ — Supabase Integration + Agent Activity
- Schema `meridian` no Supabase (mesmo projeto do KB, isolado)
- Tabelas: agents, missions/tasks, activities, metrics, quests, sessions
- RLS policies + real-time subscriptions
- React hooks (useAgents, useTasks, useActivities) com realtime
- API routes `/api/meridian/*`
- 6 agentes seed

## Phase 5 ✅ — Office 2D/3D + Analytics
- Office 2D FloorPlan + Office 3D Scene3D (dynamic SSR-safe)
- Analytics panels (MetricsPanel, ActivityHeatmap, NetworkGraph, etc.)

## Phase 6 ✅ — Cross-module Integration + Vibe Module
- Cross-module bridge (gateway events → office store → kanban)
- Vibe module (OpenClawfice AGPL merge)

## Phase 7 ✅ — Polish + Deploy
- Anti-slop: design tokens, shadow-dropdown, animate-pulse-slow
- 86 `any` justificados
- Dockerfile standalone
- Deployed: systemd + nginx at jarvis.debaotrader.com/meridian/
- Port 4000, IP-restricted, auto-restart
