const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ success: false, message: 'Email already registered.' });

    const user = new User({ name, email, password });
    await user.save();
    req.session.userId = user._id;
    req.session.userName = user.name;
    res.json({ success: true, message: 'Account created!', redirect: '/dashboard' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required.' });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    req.session.userId = user._id;
    req.session.userName = user.name;
    res.json({ success: true, redirect: '/dashboard' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true, redirect: '/' }));
});

// Get current user info
router.get('/me', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ loggedIn: true, name: req.session.userName, id: req.session.userId });
  } else {
    res.json({ loggedIn: false });
  }
});

module.exports = router;
