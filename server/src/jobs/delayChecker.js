// Periodically flips overdue tasks to 'delayed' and notifies the owning
// department. start() is only called from server.js (never from tests,
// which only require app.js) so Jest never ends up with a dangling timer.
const cron = require('node-cron');
const taskRepository = require('../repositories/taskRepository');
const notificationService = require('../services/notificationService');

// Exported separately from start() so tests can call the actual check
// logic directly, once, without waiting on a cron schedule.
async function checkForDelays() {
  const overdue = await taskRepository.findOverdue();

  for (const task of overdue) {
    await taskRepository.updateById(task._id, { status: 'delayed' });
    await notificationService.notify({
      departmentId: task.departmentId,
      taskId: task._id,
      type: 'task_delayed',
      message: `Task "${task.title}" is overdue`,
    });
  }

  return overdue.length;
}

function start() {
  // Every 5 minutes. Frequent enough to demo, cheap enough to leave running.
  cron.schedule('*/5 * * * *', () => {
    checkForDelays().catch((err) => console.error('Delay check failed:', err));
  });
}

module.exports = { start, checkForDelays };
