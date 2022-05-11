const mongoose = require('mongoose');

let User = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  reputation: { type: Number, default: 150 },
  qstnIds: { type: [String], default: [] },
  ansIds: { type: [String], default: [] },
  tagIds: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('User', User);