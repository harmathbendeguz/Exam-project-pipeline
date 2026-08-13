const Project = require('../models/Project');

const create = (data) => Project.create(data);
const findAll = () => Project.find();
const findById = (id) => Project.findById(id);
const updateById = (id, data) => Project.findByIdAndUpdate(id, data, { new: true, runValidators: true });
const deleteById = (id) => Project.findByIdAndDelete(id);

module.exports = { create, findAll, findById, updateById, deleteById };
