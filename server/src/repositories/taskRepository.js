const Task = require('../models/Task');

const create = (data) => Task.create(data);
const findByStageId = (stageId) => Task.find({ stageId });
const findById = (id) => Task.findById(id);
const updateById = (id, data) => Task.findByIdAndUpdate(id, data, { new: true, runValidators: true });
const deleteById = (id) => Task.findByIdAndDelete(id);

module.exports = { create, findByStageId, findById, updateById, deleteById };
