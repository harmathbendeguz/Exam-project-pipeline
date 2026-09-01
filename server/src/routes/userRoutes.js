const express = require('express');
const userController = require('../controllers/userController');
const taskController = require('../controllers/taskController');

const router = express.Router();

router.get('/', userController.listUsers);
router.post('/', userController.createUser);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// Nested: every task currently assigned to this user, across all
// projects/stages — the "progress" view.
router.get('/:id/tasks', taskController.listByUser);

module.exports = router;
