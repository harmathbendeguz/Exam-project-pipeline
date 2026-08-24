// Single entry point for creating a notification — used by stageService
// (task_incomplete, stage_unlocked) and the delay-detection cron job
// (task_delayed). Never called by a controller directly: notifications
// are system-generated, not something a user POSTs.
const notificationRepository = require('../repositories/notificationRepository');
const { NotFoundError } = require('../utils/errors');
const socket = require('../socket');

async function notify({ departmentId, taskId, type, message }) {
  const notification = await notificationRepository.create({ departmentId, taskId, type, message });
  socket.emit('notification:new', notification);
  return notification;
}

async function listNotifications(filter) {
  return notificationRepository.findAll(filter);
}

async function markAsRead(id) {
  const notification = await notificationRepository.updateById(id, { read: true });
  if (!notification) throw new NotFoundError(`Notification ${id} not found`);
  return notification;
}

module.exports = { notify, listNotifications, markAsRead };
