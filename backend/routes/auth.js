// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

// --- Register a new user ---
router.post('/register', async (req, res) => {
  console.log('Register route hit');
  const { username, mobile, password } = req.body;
  console.log('Register data:', { username, mobile, password: '***' });
  if (!username || !mobile || !password) {
    return res.status(400).json({ msg: 'All fields are required' });
  }
  const trimmedUsername = username.trim();
  const trimmedMobile = mobile.trim();

  // Mobile validation (basic)
  const mobileRegex = /^\d{10}$/;
  if (!mobileRegex.test(trimmedMobile)) {
    return res.status(400).json({ msg: 'Invalid mobile number' });
  }

  try {
    let user = await User.findOne({ $or: [{ username: trimmedUsername }, { mobile: trimmedMobile }] });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ username: trimmedUsername, mobile: trimmedMobile, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    const payload = { user: { id: user.id, username: user.username } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('User registered successfully');
    res.status(201).json({ msg: 'Signup successful', token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).send('Server Error');
  }
});

// --- Login a user ---
router.post('/login', async (req, res) => {
  console.log('Login route hit');
  const { username, password } = req.body;
  console.log('Login data:', { username, password: '***' });
  if (!username || !password) {
    return res.status(400).json({ msg: 'Username and password are required' });
  }
  const trimmedUsername = username.trim();

  try {
    const user = await User.findOne({ username: trimmedUsername });
    console.log('User found:', !!user);
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { user: { id: user.id, username: user.username } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login successful');
    res.json({ msg: 'Login successful', token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;