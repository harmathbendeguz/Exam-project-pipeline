// Only file allowed to talk to Department's Mongoose model. 
// rules here (e.g. "must a department exist before X") — just persistence.
const Department = require('../models/Department');

const create = (data) => Department.create(data);
const findAll = () => Department.find();
const findById = (id) => Department.findById(id);
const updateById = (id, data) => Department.findByIdAndUpdate(id, data, { new: true, runValidators: true });
const deleteById = (id) => Department.findByIdAndDelete(id);

module.exports = { create, findAll, findById, updateById, deleteById };
