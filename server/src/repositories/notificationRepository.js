const Notification = require('../models/Notification');

const create = (data) => Notification.create(data);
const findAll = (filter = {}) => Notification.find(filter).sort({ createdAt: -1 });
const findById = (id) => Notification.findById(id);
const updateById = (id, data) => Notification.findByIdAndUpdate(id, data, { new: true, runValidators: true });

module.exports = { create, findAll, findById, updateById };
