const mongoose = require('mongoose'); 
const express = require('express');
const router = express.Router();
const Topic = require('../models/topic');
const Register = require('../models/register');
const Message = require('../models/message');
const observer = require('../utils/observer');

router.get('/', async (req, res) => {
  try {
    const topics = await Topic.find();
    res.json(topics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/stats/access', async (req, res) => {
  try {
    const topicStats = await Topic.find({}, 'title accessCount');
    res.json(topicStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (topic == null) {
      return res.status(404).json({ message: 'Cannot find topic' });
    }
    
    topic.accessCount += 1;
    await topic.save();
    
    const messages = await Message.find({ topic: topic._id })
      .sort({ createdAt: -1 })
      .populate('author', 'username');
    
    res.json({ topic, messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const topic = new Topic({
    title: req.body.title,
    creator: req.body.userId
  });
  
  try {
    const newTopic = await topic.save();
    
    const user = await Register.findById(req.body.userId);
    if (!user.subscribedTopics) {
      user.subscribedTopics = [];
    }
    user.subscribedTopics.push(newTopic._id);
    await user.save();
    
    newTopic.subscribers = [req.body.userId];
    await newTopic.save();
    
    observer.subscribe(newTopic._id.toString(), req.body.userId);
    
    res.status(201).json(newTopic);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/:id/subscribe', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (topic == null) {
      return res.status(404).json({ message: 'Cannot find topic' });
    }
    
    const userId = req.body.userId;
    
    const user = await Register.findById(userId);
    if (!user.subscribedTopics) {
      user.subscribedTopics = [];
    }
    if (!user.subscribedTopics.includes(topic._id)) {
      user.subscribedTopics.push(topic._id);
      await user.save();
    }
    
    if (!topic.subscribers) {
      topic.subscribers = [];
    }
    if (!topic.subscribers.includes(userId)) {
      topic.subscribers.push(userId);
      await topic.save();
    }
    
    observer.subscribe(topic._id.toString(), userId);
    
    res.json({ message: 'Successfully subscribed to topic' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/unsubscribe', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (topic == null) {
      return res.status(404).json({ message: 'Cannot find topic' });
    }
    
    const userId = req.body.userId;
    
    const user = await Register.findById(userId);
    if (user.subscribedTopics) {
      user.subscribedTopics = user.subscribedTopics.filter(id => id.toString() !== topic._id.toString());
      await user.save();
    }
    
    if (topic.subscribers) {
      topic.subscribers = topic.subscribers.filter(id => id.toString() !== userId.toString());
      await topic.save();
    }
    
    observer.unsubscribe(topic._id.toString(), userId);
    
    res.json({ message: 'Successfully unsubscribed from topic' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/user/:userId', async (req, res) => {
  try {
    console.log(`Fetching topics for user: ${req.params.userId}`);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
      });
    }
    
    const user = await Register.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const subscribedTopics = await Promise.all(
      user.subscribedTopics.map(async (topicId) => {
        const topic = await Topic.findById(topicId);
        
        if (!topic) return null;
        
        const messages = await Message.find({ topic: topicId })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('author', 'username');
        
        return {
          topic,
          messages
        };
      })
    );
    
    const filteredTopics = subscribedTopics.filter(item => item !== null);
    
    res.json({
      success: true,
      subscribedTopics: filteredTopics
    });
    
  } catch (err) {
    console.error('Error fetching user topics:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
});

module.exports = router;