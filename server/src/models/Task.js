const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    stageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stage', required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    // Optional: a task can exist unassigned (e.g. during planning) and be
    // picked up by a specific person later via PUT. departmentId stays
    // required — it's the coarse "who owns this" the pipeline rules key
    // off of; assigneeId is the finer-grained "which person," used for
    // alert routing and per-user progress views, not for any pipeline rule.
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
