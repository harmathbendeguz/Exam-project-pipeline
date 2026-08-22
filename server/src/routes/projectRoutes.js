const express = require('express');
const projectController = require('../controllers/projectController');
const stageController = require('../controllers/stageController');

const router = express.Router();

router.get('/', projectController.listProjects);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// Nested stage creation/listing: /api/projects/:id/stages
router.get('/:id/stages', stageController.listByProject);
router.post('/:id/stages', stageController.createForProject);

module.exports = router;
