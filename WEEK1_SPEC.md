# PostFlow — Week 1 Specification
Film post-production pipeline manager · Junior Fullstack API vizsgaremek

```js
// ============================================================
// TIME PLAN — keep this block at the top of server/src/app.js
// ============================================================
// WEEK 1 (Aug 3–9):  Foundation — repo, Docker Compose, Mongoose
//                    models, CRUD API, first Supertest tests
// WEEK 2 (Aug 10–16): Business logic — sequential stage
//                    enforcement, delay-detection cron,
//                    notifications, Socket.IO events
// WEEK 3 (Aug 17–23): Frontend — dashboard, React Flow pipeline,
//                    notification panel, responsive layout
// WEEK 4 (Aug 24–30): Polish — test coverage, clean-code pass,
//                    README, OpenAPI docs, seed data, final build
// SEPT 2:  HARD DEADLINE — submit via Git (7 days before exam)
// SEPT 3–8: rehearse the 15-minute presentation
// SEPT 9:  EXAM
// ============================================================
```

---

## 1. Folder structure

```
postflow/
├── docker-compose.yml          // 3 services: client, api, mongo
├── README.md                   // required: install, config, purpose
├── docs/
│   └── openapi.yaml            // required: OpenAPI endpoint docs
├── server/                     // ── LOGIC TIER ──
│   ├── Dockerfile
│   ├── package.json
│   ├── tests/                  // Jest + Supertest
│   └── src/
│       ├── app.js              // express app (exported for tests)
│       ├── server.js           // starts http + socket.io + cron
│       ├── config/
│       │   └── db.js           // mongoose connection
│       ├── models/             // ── DATA TIER (schemas) ──
│       │   ├── Project.js
│       │   ├── Stage.js
│       │   ├── Task.js
│       │   ├── Department.js
│       │   └── Notification.js
│       ├── routes/             // URL → controller mapping only
│       ├── controllers/        // req/res handling only, no logic
│       ├── services/           // ALL business rules live here
│       ├── repositories/       // ALL db queries live here
│       └── jobs/
│           └── delayChecker.js // node-cron job (Week 2)
└── client/                     // ── PRESENTATION TIER ── (Week 3)
    ├── Dockerfile
    └── src/
```

**Why this layering (memorize for the defense):** a request flows
`route → controller → service → repository → model`. Controllers never
touch the database; repositories never contain rules. When the committee
asks "show me the three-tier architecture," you point at this flow.

---

## 2. Mongoose schemas

```js
// models/Department.js
// Departments are the notification targets ("Sound", "Color", "VFX"...)
const departmentSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true }, // used if we add nodemailer in Week 4
  },
  { timestamps: true } // createdAt/updatedAt on every doc — free audit trail
);
```

```js
// models/Project.js
// One film. Its position in the pipeline is NOT stored here —
// it is derived from its stages (single source of truth, no sync bugs).
const projectSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    client:      { type: String, trim: true },
    description: { type: String },
    deadline:    { type: Date, required: true },
    status: {
      type: String,
      enum: ['planning', 'in_progress', 'completed'],
      default: 'planning',
    },
  },
  { timestamps: true }
);
```

```js
// models/Stage.js
// One step of the pipeline (e.g. "Color Grading"), ordered by `order`.
// Sequential rule (Week 2): a stage may become 'active' only when the
// stage with order-1 is 'done'. First stage starts 'active', rest 'locked'.
const stageSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    name:      { type: String, required: true, trim: true },
    order:     { type: Number, required: true }, // 0, 1, 2... position in pipeline
    status: {
      type: String,
      enum: ['locked', 'active', 'done'],
      default: 'locked',
    },
    plannedEnd: { type: Date, required: true },
  },
  { timestamps: true }
);
// One project cannot have two stages at the same position:
stageSchema.index({ projectId: 1, order: 1 }, { unique: true });
```

```js
// models/Task.js
// The unit of work. Belongs to a stage, owned by a department.
// The Week 2 cron job flips overdue tasks to 'delayed' and
// creates a Notification for the owning department.
const taskSchema = new mongoose.Schema(
  {
    stageId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Stage', required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    title:        { type: String, required: true, trim: true },
    description:  { type: String },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'done', 'delayed'],
      default: 'todo',
    },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true }
);
```

```js
// models/Notification.js
// Written by the system (cron job / stage transitions), never by users.
// The client shows unread ones; Socket.IO pushes them live (Week 2–3).
const notificationSchema = new mongoose.Schema(
  {
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    taskId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    type: {
      type: String,
      enum: ['task_delayed', 'task_incomplete', 'stage_unlocked'],
      required: true,
    },
    message: { type: String, required: true },
    read:    { type: Boolean, default: false },
  },
  { timestamps: true }
);
```

---

## 3. Week 1 endpoints (CRUD only — no pipeline rules yet)

```
GET/POST        /api/departments          GET/PUT/DELETE /api/departments/:id
GET/POST        /api/projects             GET/PUT/DELETE /api/projects/:id
GET/POST        /api/projects/:id/stages  GET/PUT/DELETE /api/stages/:id
GET/POST        /api/stages/:id/tasks     GET/PUT/DELETE /api/tasks/:id
GET             /api/health               // first endpoint you build
```

---

## 4. Week 1 day-by-day checklist

```js
// Aug 3–4: git init, docker-compose (api + mongo), Express skeleton,
//          GET /api/health returns { status: 'ok' } FROM INSIDE the container
// Aug 5:   config/db.js + all 5 models; verify in a Mongo GUI (Compass)
// Aug 6–7: Department + Project full CRUD (route→controller→service→repo)
// Aug 8:   Stage + Task CRUD (same pattern — it goes fast the 2nd time)
// Aug 9:   Supertest: health, department CRUD, project CRUD.
//          Bonus: npm run seed script with 1 demo project + 5 stages
```
