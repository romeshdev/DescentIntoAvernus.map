const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Public routes
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Protected routes (require authentication)
router.get('/users', authenticateToken, (req, res) => {
  res.json([
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ]);
});

router.post('/users', authenticateToken, (req, res) => {
  const { name, email } = req.body;
  const newUser = {
    id: Date.now(),
    name,
    email
  };
  res.status(201).json(newUser);
});

// Protected profile route
router.get('/profile', authenticateToken, (req, res) => {
  res.json({
    user: req.user,
    message: 'This is your profile data'
  });
});

module.exports = router;