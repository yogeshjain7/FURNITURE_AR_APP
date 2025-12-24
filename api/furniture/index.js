const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Furniture = require('../../backend/models/furniture');

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

export default async function handler(req, res) {
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

  if (req.method === 'GET') {
    try {
      const furniture = await Furniture.find({});
      res.json(furniture);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server Error' });
    }
  } else if (req.method === 'POST') {
    // Optional: Add new furniture, perhaps admin only
    // For now, allow authenticated users
    const { id, name, category, dimensions, imagePath, modelPath } = req.body;
    if (!id || !name || !category || !dimensions || !imagePath || !modelPath) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    try {
      const newFurniture = new Furniture({ id, name, category, dimensions, imagePath, modelPath });
      await newFurniture.save();
      res.status(201).json(newFurniture);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server Error' });
    }
  } else {
    res.status(405).json({ msg: 'Method not allowed' });
  }
}