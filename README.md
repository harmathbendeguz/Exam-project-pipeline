# PostFlow

Film post-production pipeline manager. Tracks projects through a sequential
pipeline of stages (e.g. Editing, Color Grading, Sound), each made up of
tasks owned by departments, with automatic delay detection and notifications.

Three-tier architecture: `route → controller → service → repository → model`.
Controllers never touch the database directly; repositories never contain
business rules.

## Status

Week 1 in progress: repo scaffold, Docker Compose, and a minimal Express API
with a health check endpoint. Models, full CRUD, tests, business logic, and
the frontend land in later weeks (see `server/src/app.js` time plan).

## Install & run

Requires Docker and Docker Compose.

```bash
docker compose up --build
```

This starts:
- `api` — Express server on http://localhost:3000
- `mongo` — MongoDB on port 27017

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

## Project structure

See `server/src` for the logic tier (routes, controllers, services,
repositories, models, jobs) and `docs/openapi.yaml` for API documentation
(added in Week 4).
