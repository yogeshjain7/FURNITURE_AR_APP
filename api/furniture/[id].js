const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Furniture = require('../models/furniture');

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

module.exports = async function handler(req, res) {
  await mongoose.connect(process.env.MONGO_URI);

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ msg: 'Token is not valid' });
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const furniture = await Furniture.findOne({ id });
      if (!furniture) {
        return res.status(404).json({ msg: 'Furniture not found' });
      }
      res.json(furniture);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server Error' });
    }
  } else {
    res.status(405).json({ msg: 'Method not allowed' });
  }
}