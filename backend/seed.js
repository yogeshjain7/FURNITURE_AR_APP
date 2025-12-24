// seed.js
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Furniture = require('./models/Furniture');

const furnitureData = [
  { id: "arm-chair", category: "chair", name: "Arm Chair", dimensions: "H: 95cm W: 80cm D: 75cm", imagePath: "assets/images/Arm_Chair.png", modelPath: "assets/models/Arm_Chair.glb" },
  { id: "l-sofa", category: "sofa", name: "Brown L-Sofa", dimensions: "H: 85cm W: 240cm D: 160cm", imagePath: "assets/images/Brown_L-Sofa.png", modelPath: "assets/models/Brown_L-Sofa.glb" },
  { id: "bed", category: "bed", name: "Bed", dimensions: "H: 110cm W: 180cm D: 210cm", imagePath: "assets/images/bed.png", modelPath: "assets/models/bed.glb" },
  { id: "table-lamp", category: "lighting", name: "Table Lamp", dimensions: "H: 55cm W: 30cm D: 30cm", imagePath: "assets/images/table_lamp.png", modelPath: "assets/models/table_lamp.glb" },
  { id: "tv-stand", category: "storage", name: "TV Stand", dimensions: "H: 50cm W: 180cm D: 40cm", imagePath: "assets/images/tv_stand.png", modelPath: "assets/models/tv_stand.glb" },
  { id: "antique-desk", category: "table", name: "Antique Desk", dimensions: "H: 78cm W: 120cm D: 60cm", imagePath: "assets/images/antique_desk.png", modelPath: "assets/models/antique_desk.glb" },
  { id: "bookshelf", category: "storage", name: "Bookshelf", dimensions: "H: 180cm W: 90cm D: 30cm", imagePath: "assets/images/bookshelf.png", modelPath: "assets/models/bookshelf.glb" },
  { id: "cupboard", category: "storage", name: "Cupboard", dimensions: "H: 190cm W: 100cm D: 55cm", imagePath: "assets/images/cupboard.png", modelPath: "assets/models/cupboard.glb" },
  { id: "coffee-table", category: "table", name: "Coffee Table", dimensions: "H: 45cm W: 110cm D: 60cm", imagePath: "assets/images/coffee_table.png", modelPath: "assets/models/coffee_table.glb" },
  { id: "wood-table", category: "table", name: "Wood Table", dimensions: "H: 75cm W: 160cm D: 90cm", imagePath: "assets/images/wood_table.png", modelPath: "assets/models/wood_table.glb" }
];

const seedDB = async () => {
  await mongoose.connect(process.env.MONGO_URI, {});
  await Furniture.deleteMany({});
  await Furniture.insertMany(furnitureData);
  // Also drop users to reset
  await mongoose.connection.db.collection('users').drop().catch(err => console.log('Users collection not found or already dropped'));
  console.log('Database has been seeded!');
  mongoose.connection.close();
};

seedDB().catch(err => {
  console.error(err);
  mongoose.connection.close();
});