// models/furniture.js
const mongoose = require('mongoose');

const FurnitureSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  dimensions: {
    type: String,
    required: true
  },
  imagePath: {
    type: String,
    required: true
  },
  modelPath: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Furniture', FurnitureSchema);