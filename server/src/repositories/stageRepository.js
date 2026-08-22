const Stage = require('../models/Stage');

const create = (data) => Stage.create(data);
const findByProjectId = (projectId) => Stage.find({ projectId }).sort({ order: 1 });
const findById = (id) => Stage.findById(id);
const updateById = (id, data) => Stage.findByIdAndUpdate(id, data, { new: true, runValidators: true });
const deleteById = (id) => Stage.findByIdAndDelete(id);

module.exports = { create, findByProjectId, findById, updateById, deleteById };
