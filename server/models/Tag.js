const mongoose = require('mongoose');

let Tag = new mongoose.Schema({
  name: { type: String, required: true },
});

module.exports = mongoose.model('Tag', Tag);