const notificationService = require('../services/notificationService');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/notifications?departmentId=...&read=true|false
const listNotifications = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.departmentId) filter.departmentId = req.query.departmentId;
  if (req.query.read !== undefined) filter.read = req.query.read === 'true';
  const notifications = await notificationService.listNotifications(filter);
  res.json(notifications);
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id);
  res.json(notification);
});

module.exports = { listNotifications, markAsRead };
