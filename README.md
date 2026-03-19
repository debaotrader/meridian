<h1 align="center">Meridian</h1>

<p align="center">
  <em>Unified AI Agent Orchestration Dashboard</em>
</p>

<p align="center">
  <strong>Create tasks. Plan with AI. Dispatch to agents. Watch them work.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/debaotrader/meridian?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square" alt="TypeScript" />
</p>

---

## Features

- **Kanban** — task queue with drag-and-drop, live feed, planning mode, and agent assignment
- **Office 2D** — spatial workspace visualization with real-time agent presence
- **Office 3D** — immersive R3F environment with SSR isolation
- **Vibe** — live agent activity, accomplishments, and team pulse
- **Analytics** — session metrics, agent performance, and workspace intelligence
- **i18n** — pt-BR by default, en-US fallback
- **Dark mode first** — design system built for enterprise night-mode environments

## How it works

Meridian connects to an [OpenClaw](https://github.com/openclaw/openclaw) Gateway via WebSocket and surfaces agent activity, task state, and session data in a unified dashboard. Tasks are created in Kanban, dispatched to agents, and completed asynchronously — Meridian shows everything in real time.

## Quick Start

```bash
git clone https://github.com/debaotrader/meridian.git
cd meridian
npm install
cp .env.example .env.local
# Fill in NEXT_PUBLIC_OPENCLAW_GATEWAY_URL and NEXT_PUBLIC_OPENCLAW_API_KEY
npm run dev
```

Open [http://localhost:4000/meridian](http://localhost:4000/meridian)

## Configuration

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_OPENCLAW_GATEWAY_URL` | WebSocket URL of your OpenClaw Gateway (e.g. `wss://your-domain.com`) |
| `NEXT_PUBLIC_OPENCLAW_API_KEY` | API key for the Gateway |
| `OPENCLAW_GATEWAY_URL` | Server-side WS URL (internal, e.g. `ws://127.0.0.1:18789`) |
| `OPENCLAW_GATEWAY_TOKEN` | Server-side auth token |
| `PORT` | Port to run on (default: `4000`) |
| `MC_API_TOKEN` | Token for internal API routes |
| `WEBHOOK_SECRET` | HMAC secret for agent completion webhooks |
| `OPENCLAW_ENABLE_VIBE` | Set to `1` to enable Vibe module |
| `OPENCLAW_ENABLE_OFFICE_3D` | Set to `1` to enable 3D Office module |

## Architecture

```
meridian/
├── app/                  # Next.js App Router
│   ├── kanban/           # Task queue + planning
│   ├── office/           # 2D spatial view
│   │   └── 3d/           # R3F 3D view (ssr:false isolated)
│   ├── vibe/             # Agent activity feed
│   ├── analytics/        # Metrics dashboard
│   └── api/              # Internal API routes + webhooks
├── src/
│   ├── components/       # UI components by module
│   ├── lib/              # Gateway client, API utils, i18n
│   └── store/            # Zustand state management
├── scripts/
│   └── check-r3f-ssr.mjs # SSR boundary enforcement
└── deploy.sh             # Production deploy script
```

## Deploy

Requires Node.js 20+, runs as a standalone Next.js app.

```bash
# Build
npm run build

# Run
PORT=4000 node .next/standalone/server.js
```

For systemd deploy with rsync, use the included `deploy.sh`.

## License

MIT — Copyright (c) 2026 Deber Bezerra Junior
