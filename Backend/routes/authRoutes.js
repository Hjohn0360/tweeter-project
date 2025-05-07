const express = require('express');
const router = express.Router();
const Register = require('../models/register');
const AuthController = require('../controllers/AuthController');

router.post('/login', async (req, res) => {
  try {
    const { username } = req.body;
    
    const user = await Register.findOne({ username });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const dashboard = await AuthController.getDashboard(user._id);
    
    res.json(dashboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;