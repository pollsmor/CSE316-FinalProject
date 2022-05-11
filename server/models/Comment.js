const mongoose = require('mongoose');

let Comment = new mongoose.Schema({
  text: { type: String, required: true },
  commented_by: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Comment', Comment);