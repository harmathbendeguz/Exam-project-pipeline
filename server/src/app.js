const express = require('express');
const cors = require('cors');

const departmentRoutes = require('./routes/departmentRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/departments', departmentRoutes);
app.use('/api/projects', projectRoutes);

// No route matched.
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Centralized error handler. Every controller is wrapped in asyncHandler,
// so any thrown/rejected error — ours or Mongoose's — ends up here instead
// of each controller needing its own try/catch and status-code guessing.
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  if (err.name === 'ValidationError') {
    // Mongoose schema validation failed (missing required field, bad enum...)
    return res.status(400).json({ error: err.message });
  }
  if (err.name === 'CastError') {
    // e.g. GET /api/projects/not-a-valid-id
    return res.status(400).json({ error: `Invalid id: ${err.value}` });
  }
  if (err.code === 11000) {
    // Duplicate key on a unique index (Department.name, Stage {projectId, order}...)
    return res.status(409).json({ error: 'Duplicate value violates a unique constraint' });
  }

  const statusCode = err.statusCode || 500;
  if (statusCode === 500) console.error(err);
  res.status(statusCode).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
