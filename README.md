# IncidentHub — Real-Time Incident Management Dashboard

Minimal runnable implementation for the case study. This README covers everything needed to run the project locally (with Docker and without), the environment variables required, and helpful troubleshooting notes.

Quick links
- API: http://localhost:3000
- UI: http://localhost:5173

Prerequisites
- Node.js 18+ (recommended)
- npm (or yarn/pnpm)
- Docker & Docker Compose (for containerized runs)
- Git

Repository layout
- `IncidentHub.API/` — NestJS backend (Prisma + Socket.IO)
- `IncidentHub.UI/` — React + Vite frontend (TypeScript, Ant Design, react-query)

Environment files
- The repo does not commit secrets. Create a `.env` file at the repository root for Docker-compose (or set CI secrets) and `.env` files for the services when running locally without Docker.

Example `.env` (repository root, used by `docker-compose`)
```env
# Postgres (example for docker-compose)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=incidenthub_dev

# API
API_PORT=3000
# Prisma expects DATABASE_URL; point this to the Postgres instance (docker-compose uses the service name `db`)
DATABASE_URL=postgresql://postgres:postgres@db:5432/incidenthub_dev?schema=public

# UI / Vite
# Vite reads env vars prefixed with VITE_ for the frontend
VITE_API_BASE_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000

```

Example `.env` for local (non-docker) development — put under `IncidentHub.API/.env` and `IncidentHub.UI/.env` as needed.

`IncidentHub.API/.env` (local DB example)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/incidenthub_dev?schema=public
PORT=3000
```

`IncidentHub.UI/.env` (Vite)
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

How to run (Docker) — full containerized stack
1. From the repository root create the repo-level `.env` as shown above (or adjust `docker-compose.override.yml`).
2. Build and start the stack:

```bash
docker-compose up --build
```

3. Services will be available at:
- API: http://localhost:3000
- UI: http://localhost:5173

Notes:
- If you mount local code into containers for development, make sure Docker has file permissions.
- The `start.ps1` helper (Windows) automates building the UI, building Docker images, and running `docker-compose`.

How to run (no Docker) — local development

1) Backend (API)

```bash
cd IncidentHub.API
npm install
# generate Prisma client
npx prisma generate
# run migrations (creates DB schema). Make sure `DATABASE_URL` points to a running Postgres instance
npx prisma migrate dev --name init
# seed the database (project includes a seed)
npx prisma db seed
# start in dev mode (NestJS watch)
npm run start:dev
```

2) Frontend (UI)

```bash
cd IncidentHub.UI
npm install
# ensure VITE_API_BASE_URL is set in IncidentHub.UI/.env
npm run dev
```

3) Quick smoke test
- Open `http://localhost:5173` in your browser. Create an incident and confirm it appears. If you have two browser windows open the second should receive the created event via Socket.IO.

Common env variables (summary)
- `DATABASE_URL` — Postgres connection string for Prisma (required by API).
- `PORT` / `API_PORT` — port for the API (default 3000).
- `VITE_API_BASE_URL` — base URL the UI uses to call the API.
- `VITE_SOCKET_URL` — Socket.IO URL for the UI.

CI / Deploy notes
- The GitHub Actions workflow (if present) should set Docker registry secrets and the same `DATABASE_URL` for integration tests.
- For production, point `DATABASE_URL` at a managed Postgres and secure `VITE_API_BASE_URL` to your public API URL.

Troubleshooting
- Prisma errors: ensure `npx prisma migrate dev` has run and `DATABASE_URL` is correct.
- Socket not connecting: check `VITE_SOCKET_URL` and CORS on the API. Logs in the browser console and API logs help.
- If `npm ci` fails in CI with network errors, re-run the job (transient) or add caching to workflows.

Testing
- API: there are unit/e2e tests under `IncidentHub.API/test`. Run them with `npm test` in `IncidentHub.API`.

Support & next steps
- If you'd like, I can:
	- Add a `docker-compose.override.yml` for local mounts and hot-reload.
	- Add a simple `Makefile` or `npm` scripts at repo root for common workflows.
	- Commit and push these README and `.gitignore` edits and create a release.

---

Additional Project Notes

1) Technologies used
- Backend: Node.js, NestJS, TypeScript, Prisma ORM, PostgreSQL, Socket.IO
- Frontend: React, Vite, TypeScript, Ant Design, @tanstack/react-query, axios, socket.io-client
- Dev/Infra: Docker, Docker Compose, GitHub Actions (CI), Nginx (UI container)

2) Architectural approach
- Clean separation between `IncidentHub.API` (REST + realtime events) and `IncidentHub.UI` (single-page app). The API is authoritative for data and emits Socket.IO events (`incident.created|updated|deleted`) for realtime updates. The UI uses `react-query` for server state and a `SocketProvider` to centralize socket handling and trigger cache invalidation/refetches.
- Prisma is used as the data access layer with migrations and a seeded dev dataset. The UI defers server-managed fields (e.g. `status`) to the backend defaults when creating records.

---

Note on potential enhancements

The following items are potential enhancements and are NOT implemented in this repository at the moment:

- AI integration: automated incident triage, smart summaries, or suggestion tooling to help prioritize and categorize incidents.
- Security hardening: add authentication/authorization (JWT/OAuth), RBAC, input validation, rate limiting, and secrets management for production deployments.
- CORS and network policy review: tighten CORS rules, set proper allowed origins and headers, and review network-level policies for deployed environments.

These are ideas for future work and have not been added to the codebase yet.

---
