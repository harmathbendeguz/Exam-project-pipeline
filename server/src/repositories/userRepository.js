const User = require('../models/User');

const create = (data) => User.create(data);
const findAll = () => User.find();
const findById = (id) => User.findById(id);
const updateById = (id, data) => User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
const deleteById = (id) => User.findByIdAndDelete(id);

module.exports = { create, findAll, findById, updateById, deleteById };
