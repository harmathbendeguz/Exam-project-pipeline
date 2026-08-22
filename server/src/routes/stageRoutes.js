// Mounted at /api/stages. No top-level POST /api/stages here — creation
// only happens nested under a project (see projectRoutes.js), because a
// Stage without a projectId doesn't make sense.
const express = require('express');
const stageController = require('../controllers/stageController');
const taskController = require('../controllers/taskController');

const router = express.Router();

router.get('/:id', stageController.getStage);
router.put('/:id', stageController.updateStage);
router.delete('/:id', stageController.deleteStage);

// Nested task creation/listing: /api/stages/:id/tasks
router.get('/:id/tasks', taskController.listByStage);
router.post('/:id/tasks', taskController.createForStage);

module.exports = router;
