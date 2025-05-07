class TopicObserver {
    constructor() {
      this.observers = {};
    }
  
    subscribe(topicId, userId) {
      if (!this.observers[topicId]) {
        this.observers[topicId] = [];
      }
      if (!this.observers[topicId].includes(userId)) {
        this.observers[topicId].push(userId);
      }
    }
  
    unsubscribe(topicId, userId) {
      if (this.observers[topicId]) {
        this.observers[topicId] = this.observers[topicId].filter(id => id !== userId);
      }
    }
  
    notify(topicId, message) {
      if (this.observers[topicId]) {
        console.log(`Notifying ${this.observers[topicId].length} subscribers of topic ${topicId}`);
        return this.observers[topicId];
      }
      return [];
    }
  }
  
  module.exports = new TopicObserver();