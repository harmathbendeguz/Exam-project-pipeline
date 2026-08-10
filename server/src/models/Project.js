const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    client: { type: String, trim: true },
    description: { type: String },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ['planning', 'in_progress', 'completed'],
      default: 'planning',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
