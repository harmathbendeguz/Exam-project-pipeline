const Task = require('../models/Task');

const create = (data) => Task.create(data);
const findByStageId = (stageId) => Task.find({ stageId });
const findByAssigneeId = (assigneeId) => Task.find({ assigneeId });
const findById = (id) => Task.findById(id);
const updateById = (id, data) => Task.findByIdAndUpdate(id, data, { new: true, runValidators: true });
const deleteById = (id) => Task.findByIdAndDelete(id);

// Cascade helper: removes every task under any of the given stages.
// Used when a Stage or Project is deleted, so tasks don't outlive their
// parent as orphaned documents nothing can ever reach again.
const deleteByStageIds = (stageIds) => Task.deleteMany({ stageId: { $in: stageIds } });

// Used only by the delay-detection cron job: not-yet-finished tasks whose
// due date has already passed. 'done' and 'delayed' are excluded so an
// already-flagged task doesn't get re-processed (and re-notified) forever.
const findOverdue = () =>
  Task.find({ status: { $in: ['todo', 'in_progress'] }, dueDate: { $lt: new Date() } });

module.exports = {
  create,
  findByStageId,
  findByAssigneeId,
  findById,
  updateById,
  deleteById,
  deleteByStageIds,
  findOverdue,
};
