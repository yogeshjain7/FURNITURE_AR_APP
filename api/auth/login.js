const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../backend/models/user');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('Login API called');
  if (req.method !== 'POST') {
    return res.status(405).json({ msg: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: 'Username and password are required' });
  }

  const trimmedUsername = username.trim();

  try {
    console.log('MONGO_URI present:', !!process.env.MONGO_URI);
    console.log('JWT_SECRET present:', !!process.env.JWT_SECRET);
    console.log('Attempting to connect to MongoDB');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');

    const user = await User.findOne({ username: trimmedUsername });
    if (!user) {
      console.log('User not found:', trimmedUsername);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', trimmedUsername);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { user: { id: user.id, username: user.username } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login successful for user:', trimmedUsername);

    res.json({ msg: 'Login successful', token });
  } catch (err) {
    console.error('Error in login:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
}