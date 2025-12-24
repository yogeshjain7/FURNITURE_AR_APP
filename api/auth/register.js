const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../backend/models/user');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ msg: 'Method not allowed' });
  }

  const { username, mobile, password } = req.body;

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
    await mongoose.connect(process.env.MONGO_URI);

    let user = await User.findOne({ $or: [{ username: trimmedUsername }, { mobile: trimmedMobile }] });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({ username: trimmedUsername, mobile: trimmedMobile, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = { user: { id: user.id, username: user.username } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ msg: 'Signup successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
}