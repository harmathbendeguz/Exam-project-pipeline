// Single entry point for creating a notification — used by stageService
// (task_incomplete, stage_unlocked) and the delay-detection cron job
// (task_delayed). Never called by a controller directly: notifications
// are system-generated, not something a user POSTs.
const notificationRepository = require('../repositories/notificationRepository');
const departmentRepository = require('../repositories/departmentRepository');
const taskRepository = require('../repositories/taskRepository');
const userRepository = require('../repositories/userRepository');
const { NotFoundError } = require('../utils/errors');
const socket = require('../socket');
const mailer = require('../mailer');

const SUBJECT = {
  task_delayed: 'A task is overdue',
  task_incomplete: 'A task is blocking a stage',
  stage_unlocked: 'A stage is now active',
};

// Alerts go to whoever is most specifically responsible: the task's
// assignee if one is set, otherwise the owning department. Neither
// lookup failing (task/user/department deleted, or no assignee) should
// ever break notification creation — it just means no email goes out.
async function resolveAlertEmail({ departmentId, taskId }) {
  if (taskId) {
    const task = await taskRepository.findById(taskId);
    if (task?.assigneeId) {
      const assignee = await userRepository.findById(task.assigneeId);
      if (assignee?.email) return assignee.email;
    }
  }
  const department = await departmentRepository.findById(departmentId);
  return department?.email;
}

async function notify({ departmentId, taskId, type, message }) {
  const notification = await notificationRepository.create({ departmentId, taskId, type, message });
  socket.emit('notification:new', notification);

  const to = await resolveAlertEmail({ departmentId, taskId });
  await mailer.sendAlert({ to, subject: SUBJECT[type] || 'PostFlow notification', text: message });

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
