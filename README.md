# PostFlow

Film post-production pipeline manager. Tracks projects through a sequential
pipeline of stages (e.g. Editing, Color Grading, Sound), each made up of
tasks owned by departments, with automatic delay detection and notifications.

Three-tier architecture: `route → controller → service → repository → model`.
Controllers never touch the database directly; repositories never contain
business rules.

## Status

All four planned weeks complete, plus a post-submission addition (Users
and email alerts): repo scaffold, Docker Compose, 6 Mongoose models, full
CRUD for every resource, sequential stage enforcement, a delay-detection
cron job, system-generated notifications (live over Socket.IO **and**
email), a React dashboard (including creating/deleting projects) with a
React Flow pipeline view and a live notification panel, 74
Jest/Supertest tests, and the OpenAPI spec at
[`docs/openapi.yaml`](docs/openapi.yaml) (see `server/src/app.js` time plan).

### Users & task assignment

- `User` (name, email, department) is **attribution only** — no
  password, no session, not authentication. It exists so a Task can be
  assigned to a specific person (`Task.assigneeId`, optional) and their
  progress tracked via `GET /api/users/:id/tasks`.
- Every notification also sends an email alert: to the task's assignee
  if one is set, otherwise to the owning department
  (`Department.email`). Configure via `SMTP_*` env vars — unconfigured
  (the default), it logs instead of sending, so no real credentials are
  ever required for dev or for the test suite.
- Backend is tested (`tests/user.test.js`, `tests/mailer.test.js`,
  `tests/notificationEmail.test.js`). On the frontend: an **"Acting as"**
  picker in the header (who you are, remembered per-browser via
  `localStorage`, not a login), an assignee dropdown on every task in
  the stage panel, and toast popups for live alerts — shown alongside
  the existing notification bell, not replacing it.

### Frontend

- **Dashboard** (`/`) — lists all projects with status and deadline.
  **+ New Project** creates one inline; each card has a **Delete**
  button (with a confirm step — deleting a project cascades to its
  stages and tasks, so this is a real "are you sure").
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
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `ALERTS_FROM` —
  optional. Unset (the default), notification emails are logged instead
  of sent — no real mail account is required to run or test the app.

Copy `client/.env.example` to `client/.env` and adjust as needed:

- `VITE_API_URL` — where the browser reaches the API (default
  `http://localhost:3000`). Must be host-reachable, not the internal
  Docker service name — the client runs in the browser, not the container.

## Tests & seed data

From `server/`:

```bash
npm test                # Jest + Supertest; in-memory MongoDB, no Docker needed
npm test -- --coverage  # same, with a coverage report
npm run seed             # wipes and repopulates: 5 departments, one 5-stage
                          # project with 2 tasks per stage, and a second,
                          # stage-less project. Run against a real MONGO_URI
                          # (e.g. with docker compose up).
```

74 tests across 12 files: CRUD + validation + 404/400/409 paths for every
resource, the full sequential-stage rule set (including edge cases like
completing the last stage in a pipeline, and de-duplicating notifications
across multiple tasks in the same department), cascade deletes
(Project → Stages → Tasks), the delay-detection cron job, email-alert
routing (assignee vs. department, mocked — no real SMTP connection), and
a real Socket.IO round-trip.

## API documentation

The full endpoint reference — request/response shapes, every documented
status code, and the pipeline-rule semantics on `PUT /api/stages/:id` — is
in [`docs/openapi.yaml`](docs/openapi.yaml) (OpenAPI 3.0). Paste it into
[editor.swagger.io](https://editor.swagger.io) for an interactive view.

## Project structure

See `server/src` for the logic tier: `routes` → `controllers` → `services`
→ `repositories` → `models`, plus `jobs/delayChecker.js` for the cron job.
`client/src` mirrors the same layering on the frontend: `api/` (only files
that call `fetch`), `hooks/` (data + Socket.IO state), `components/` and
`pages/` (presentation only).
