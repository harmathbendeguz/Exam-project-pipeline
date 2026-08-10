const mongoose = require('mongoose');

const stageSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    name: { type: String, required: true, trim: true },
    order: { type: Number, required: true },
    status: {
      type: String,
      enum: ['locked', 'active', 'done'],
      default: 'locked',
    },
    plannedEnd: { type: Date, required: true },
  },
  { timestamps: true }
);

stageSchema.index({ projectId: 1, order: 1 }, { unique: true });

module.exports = mongoose.model('Stage', stageSchema);
