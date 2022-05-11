const mongoose = require('mongoose');

const Comment = require('./Comment');

let Question = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, default: '' },
  text: { type: String, default: '' },
  tagIds: { type: [String], default: [] },
  views: { type: Number, default: 0 },
  upvote_uids: { type: [String], default: [] },
  downvote_uids: { type: [String], default: [] },
  ansIds: { type: [String], default: []},
  asked_by: { type: String, required: true },
  comments: { type: [Comment.schema], default: []}
}, { timestamps: true });

module.exports = mongoose.model('Question', Question);