const mongoose = require('mongoose');

const Comment = require('./Comment');

let Answer = new mongoose.Schema({
  text: { type: String, required: true },
  upvote_uids: { type: [String], default: [] },
  downvote_uids: { type: [String], default: [] },
  ans_by: { type: String, required: true },
  comments: { type: [Comment.schema], default: []}
}, { timestamps: true });

module.exports = mongoose.model('Answer', Answer);