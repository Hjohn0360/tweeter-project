const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const Topic = require('../models/topic');
const Register = require('../models/register');
const observer = require('../utils/observer');

router.get('/topic/:topicId', async (req, res) => {
  try {
    console.log(`Fetching messages for topic: ${req.params.topicId}`);
    const messages = await Message.find({ topic: req.params.topicId })
      .sort({ createdAt: -1 })
      .populate('author', 'username');
    
    console.log(`Found ${messages.length} messages for topic`);
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    console.log('Message POST request received with body:', req.body);
    
    if (!req.body.content || !req.body.userId || !req.body.topicId) {
      console.log('Missing required fields in request body');
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['content', 'userId', 'topicId'],
        received: Object.keys(req.body)
      });
    }
    
    const user = await Register.findById(req.body.userId);
    if (!user) {
      console.log(`User not found with ID: ${req.body.userId}`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    const topic = await Topic.findById(req.body.topicId);
    if (!topic) {
      console.log(`Topic not found with ID: ${req.body.topicId}`);
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    console.log(`User: ${user.username}, Topic: ${topic.title}`);
    
    const isSubscribed = user.subscribedTopics && 
                        user.subscribedTopics.some(id => id.toString() === req.body.topicId);
    
    console.log(`User subscribed to topic: ${isSubscribed}`);
    
    if (!isSubscribed) {
      return res.status(403).json({ message: 'You must be subscribed to post in this topic' });
    }
    
    const message = new Message({
      content: req.body.content,
      author: req.body.userId,
      topic: req.body.topicId
    });
    
    console.log('Attempting to save message:', message);
    
    const newMessage = await message.save();
    console.log('Message saved successfully with ID:', newMessage._id);
    
    try {
      if (typeof observer.notify === 'function') {
        observer.notify(req.body.topicId, {
          messageId: newMessage._id,
          author: req.body.userId,
          content: req.body.content
        });
        console.log('Observer notification sent');
      } else {
        console.log('Observer.notify is not a function');
      }
    } catch (observerError) {
      console.error('Error in observer notification:', observerError);
    }
    
    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Error creating message:', err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;