// Mounted at /api/tasks. Same story as stageRoutes: no top-level POST,
// tasks are only created nested under a stage.
const express = require('express');
const taskController = require('../controllers/taskController');

const router = express.Router();

router.get('/:id', taskController.getTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
