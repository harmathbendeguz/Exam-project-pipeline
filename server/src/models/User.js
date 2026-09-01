const mongoose = require('mongoose');

// Lightweight identity — attribution only, not authentication. No
// password, no session. A person picks themself in the UI so tasks can
// be assigned to them and their progress tracked; nothing here gates
// access to any endpoint.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
