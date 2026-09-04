const Stage = require('../models/Stage');

const create = (data) => Stage.create(data);
const findByProjectId = (projectId) => Stage.find({ projectId }).sort({ order: 1 });
const findByProjectAndOrder = (projectId, order) => Stage.findOne({ projectId, order });
const findById = (id) => Stage.findById(id);
const updateById = (id, data) => Stage.findByIdAndUpdate(id, data, { new: true, runValidators: true });
const deleteById = (id) => Stage.findByIdAndDelete(id);
const deleteByProjectId = (projectId) => Stage.deleteMany({ projectId });

module.exports = {
  create,
  findByProjectId,
  findByProjectAndOrder,
  findById,
  updateById,
  deleteById,
  deleteByProjectId,
};
