const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Register',
    required: true
  },
  subscribers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Register'
  }],
  accessCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Topic', topicSchema);