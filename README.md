# PostFlow

Film post-production pipeline manager. Tracks projects through a sequential
pipeline of stages (e.g. Editing, Color Grading, Sound), each made up of
tasks owned by departments, with automatic delay detection and notifications.

Three-tier architecture: `route → controller → service → repository → model`.
Controllers never touch the database directly; repositories never contain
business rules.

## Status

Week 1, 2 & 3 complete: repo scaffold, Docker Compose, all 5 Mongoose
models, full CRUD for Department/Project/Stage/Task, sequential stage
enforcement, a delay-detection cron job, system-generated notifications,
live Socket.IO updates, and a React dashboard with a React Flow pipeline
view and a live notification panel. 26 Jest/Supertest tests. Week 4 is
polish: coverage, a clean-code pass, and OpenAPI docs (see
`server/src/app.js` time plan).

### Frontend (Week 3)

- **Dashboard** (`/`) — lists all projects with status and deadline.
- **Project view** (`/projects/:id`) — the pipeline rendered with React
  Flow: one node per Stage, colored by status, connected in order.
  Clicking a node opens a panel of that Stage's Tasks — mark a Task
  done, or attempt to complete the Stage (a still-incomplete Task shows
  the API's `409` message inline, exactly as returned).
  Completing a Stage re-fetches and shows the next one unlocking live.
- **Notification bell** (every page) — badge count of unread
  notifications; the panel lists them newest-first and marks read on
  click. New notifications arrive over Socket.IO with no polling.
- **Responsive**: the pipeline/task-panel layout stacks vertically and
  the notification panel goes full-width below 768px.

### Pipeline rules (Week 2)

- A new Stage starts `active` if it's order `0`, `locked` otherwise.
- A Stage can only move to `active` once the previous Stage is `done`.
- A Stage can only move to `done` if it's `active` and every Task under it
  is `done` — otherwise the request is rejected (`409`) and each blocking
  department gets a `task_incomplete` notification.
- Completing a Stage unlocks the next one (`locked → active`) and notifies
  every department with a Task in it (`stage_unlocked`).
- Every 5 minutes, `jobs/delayChecker.js` flips overdue `todo`/`in_progress`
  Tasks to `delayed` and notifies the owning department (`task_delayed`).
- Every notification is broadcast live over Socket.IO as `notification:new`
  the moment it's created, and readable via
  `GET /api/notifications` / `PATCH /api/notifications/:id/read`.

## Install & run

Requires Docker and Docker Compose.

```bash
docker compose up --build
```

This starts:
- `api` — Express server on http://localhost:3000
- `mongo` — MongoDB on port 27017
- `client` — React app on http://localhost:5173

Check the API is up:

```bash
curl http://localhost:3000/api/health
# { "status": "ok" }
```

## Configuration

Copy `server/.env.example` to `server/.env` and adjust as needed:

- `PORT` — port the API listens on (default `3000`)
- `MONGO_URI` — MongoDB connection string (default points at the `mongo`
  service in Docker Compose)

Copy `client/.env.example` to `client/.env` and adjust as needed:

- `VITE_API_URL` — where the browser reaches the API (default
  `http://localhost:3000`). Must be host-reachable, not the internal
  Docker service name — the client runs in the browser, not the container.

## Tests & seed data

From `server/`:

```bash
npm test    # Jest + Supertest; spins up an in-memory MongoDB, no Docker needed
npm run seed  # wipes and repopulates Project/Stage with one demo pipeline
              # (run this against a real MONGO_URI, e.g. with docker compose up)
```

## Project structure

See `server/src` for the logic tier (routes, controllers, services,
repositories, models, jobs) and `docs/openapi.yaml` for API documentation
(added in Week 4).
