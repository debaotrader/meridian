# Meridian — Plano de Fases

## Phase 1 ✅ — Scaffold + Structure
- Next.js 15 + React 19 project criado
- Tailwind config com design tokens customizados
- 17 componentes MC movidos para `src/components/kanban/`
- Build passando

## Phase 2 🔄 — WsProvider + Gateway Integration
- Copiar/criar event-parser e mock-adapter em `src/lib/gateway/`
- Criar ws-provider.tsx — React context para WebSocket com reconnect exponencial
- Criar use-gateway.ts — hook re-export
- Criar office-store.ts — Zustand + Immer store (agents state, feedEvent)
- Criar ConnectionStatus.tsx — indicador visual de conexão
- Criar ClientProviders.tsx — wrapper client-side para WsProvider no layout server
- Atualizar layout.tsx e Sidebar
- .env.local com URLs do gateway

## Phase 3 🔄 — Kanban Module Visual Redesign
- Substituir TODOS os tokens genéricos pelos tokens customizados do design system
- Criar KanbanView.tsx — layout composto (MissionQueue + PlanningTab + LiveFeed)
- Atualizar kanban/page.tsx
- Zero lógica alterada, apenas visual

## Phase 4 — Supabase Integration + Agent Activity
- Schema meridian já criado no Supabase (mesmo projeto, isolado do KB)
- Tabelas: agents, missions, events, metrics
- RLS policies + real-time subscriptions
- Hooks para consumir dados no frontend

## Phase 5 — Dashboard + Analytics
- Página principal com métricas de agentes
- Gráficos de atividade, status cards, filtros

## Phase 6 — Polish + Deploy
- Animações, responsividade, error boundaries
- Deploy em preview
