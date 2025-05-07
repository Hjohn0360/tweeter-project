const express = require('express');
const router  = express.Router();
const Register = require('../models/register');
const Topic = require('../models/topic');

router.get('/', async (req, res) => {
  try {
    const register = await Register.find();
    res.json(register);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', getRegister, (req, res) => {
  res.json(res.register);
});

router.post('/', async (req, res) => {
  const register = new Register({
    username: req.body.username,
    registerToTweeter: req.body.registerToTweeter
  });

  try {
    const newRegister = await register.save();
    res.status(201).json(newRegister);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/:id', getRegister, async (req, res) => {
  if (req.body.username != null) {
    res.register.username = req.body.username;
  }
  if (req.body.registerToTweeter != null) {
    res.register.registerToTweeter = req.body.registerToTweeter;
  }

  try {
    const updatedRegister = await res.register.save();
    res.json(updatedRegister);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', getRegister, async (req, res) => {
  try {
    await res.register.remove();
    res.json({ message: 'Deleted user' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getRegister(req, res, next) {
  let register;
  try {
    register = await Register.findById(req.params.id);
    if (register == null) {
      return res.status(404).json({ message: 'Cannot find registered user' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.register = register;
  next();
}


router.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }
    
    const user = await Register.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    let subscribedTopics = [];
    if (user.subscribedTopics && user.subscribedTopics.length > 0) {
      subscribedTopics = await Promise.all(
        user.subscribedTopics.map(async (topicId) => {
          try {
            const topic = await Topic.findById(topicId).populate({
              path: 'messages',
              options: { sort: { createdAt: -1 }, limit: 5 },
              populate: {
                path: 'author',
                select: 'username'
              }
            });
            
            return topic ? {
              topic,
              messages: topic.messages || []
            } : null;
          } catch (err) {
            console.error(`Error fetching topic ${topicId}:`, err);
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
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
