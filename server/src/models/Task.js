const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    stageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stage', required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'done', 'delayed'],
      default: 'todo',
    },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
