const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../backend/models/user');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ msg: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: 'Username and password are required' });
  }

  const trimmedUsername = username.trim();

  try {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOne({ username: trimmedUsername });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { user: { id: user.id, username: user.username } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ msg: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
}