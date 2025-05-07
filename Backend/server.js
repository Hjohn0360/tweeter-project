
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb+srv://johnharris7:vqHB0rOHllWCN8LS@cluster0.sr6rk3i.mongodb.net/')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const registerRouter = require('./routes/register');
const topicRouter = require('./routes/topic');
const messageRouter = require('./routes/message');
const authRouter = require('./routes/auth'); 

app.use('/register', registerRouter);
app.use('/login', authRouter); 
app.use('/topics', topicRouter);
app.use('/messages', messageRouter);

app.use(express.static(path.join(__dirname, '../public')));

app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ 
    error: 'Server error', 
    message: err.message 
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});