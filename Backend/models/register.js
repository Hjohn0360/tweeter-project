const mongoose = require('mongoose');

const registerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  registerToTweeter: {
    type: String,
    required: true
  },
  registerDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  subscribedTopics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }]
});

module.exports = mongoose.model('Register', registerSchema);