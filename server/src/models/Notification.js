const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    type: {
      type: String,
      enum: ['task_delayed', 'task_incomplete', 'stage_unlocked'],
      required: true,
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
