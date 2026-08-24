// No POST here — notifications are only ever created by the system
// (stageService, the delay cron job), never submitted by a client.
const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.get('/', notificationController.listNotifications);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
