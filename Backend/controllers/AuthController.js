const Register = require('../models/register');
const Topic = require('../models/topic');
const Message = require('../models/message');

class AuthController {
  async getDashboard(userId) {
    try {
      const user = await Register.findById(userId).populate('subscribedTopics');
      
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      
      const topicsWithMessages = await Promise.all(
        (user.subscribedTopics || []).map(async (topic) => {
          const messages = await Message.find({ topic: topic._id })
            .sort({ createdAt: -1 })
            .limit(2)
            .populate('author', 'username');
          
          return {
            topic: topic,
            messages: messages
          };
        })
      );
      
      return {
        success: true,
        user: {
          id: user._id,
          username: user.username
        },
        subscribedTopics: topicsWithMessages,
        availableTopics: await Topic.find({ _id: { $nin: user.subscribedTopics || [] } })
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Server error' };
    }
  }
}

module.exports = new AuthController();