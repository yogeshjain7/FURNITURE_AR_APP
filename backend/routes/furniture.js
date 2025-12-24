// routes/furniture.js
const express = require('express');
const Furniture = require('../models/Furniture');
const router = express.Router();

// --- Get all furniture items ---
router.get('/', async (req, res) => {
  console.log('Furniture route hit');
  try {
    const furnitureItems = await Furniture.find();
    console.log('Furniture items found:', furnitureItems.length);
    res.json(furnitureItems);
  } catch (err) {
    console.error('Error fetching furniture:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;