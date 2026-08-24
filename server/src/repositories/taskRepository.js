const Task = require('../models/Task');

const create = (data) => Task.create(data);
const findByStageId = (stageId) => Task.find({ stageId });
const findById = (id) => Task.findById(id);
const updateById = (id, data) => Task.findByIdAndUpdate(id, data, { new: true, runValidators: true });
const deleteById = (id) => Task.findByIdAndDelete(id);

// Used only by the delay-detection cron job: not-yet-finished tasks whose
// due date has already passed. 'done' and 'delayed' are excluded so an
// already-flagged task doesn't get re-processed (and re-notified) forever.
const findOverdue = () =>
  Task.find({ status: { $in: ['todo', 'in_progress'] }, dueDate: { $lt: new Date() } });

module.exports = { create, findByStageId, findById, updateById, deleteById, findOverdue };
