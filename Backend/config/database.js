const mongoose = require('mongoose');

class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    
    this.connection = null;
    Database.instance = this;
  }

  async connect(url) {
    if (!this.connection) {
      const connectionString = 'mongodb+srv://johnharris7:vqHB0rOHllWCN8LS@cluster0.sr6rk3i.mongodb.net/';
      this.connection = await mongoose.connect(connectionString);
      console.log('Connected to Database via Singleton');
    }
    return this.connection;
  }

  getConnection() {
    return mongoose.connection;
  }
}

module.exports = new Database();