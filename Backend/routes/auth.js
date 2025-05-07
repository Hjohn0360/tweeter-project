
const express = require('express');
const router = express.Router();
const Register = require('../models/register');
const Topic = require('../models/topic');

router.post('/', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }
    
    const user = await Register.findOne({ username }).exec();
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    let subscribedTopics = [];
    
    if (user.subscribedTopics && user.subscribedTopics.length > 0) {
      subscribedTopics = await Promise.all(
        user.subscribedTopics.map(async (topicId) => {
          try {
            const topic = await Topic.findById(topicId);
            if (!topic) return null;
            
            return { topic, messages: [] }; 
          } catch (err) {
            return null;
          }
        })
      );
      
      subscribedTopics = subscribedTopics.filter(item => item !== null);
    }
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        id: user._id,
        username: user.username
      },
      subscribedTopics
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

module.exports = router;