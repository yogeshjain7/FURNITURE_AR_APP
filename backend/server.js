require('dotenv').config({ path: '../.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- CORS Configuration ---
// Allow all origins for development
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));
// --- End of CORS Configuration ---


// Serve static files from the frontend directory
app.use(express.static('../frontend'));

// Middleware to parse incoming JSON requests
app.use(express.json());

// --- Connect to MongoDB ---
// Reads the connection string from your .env file (or Render's environment variables)
mongoose.connect(process.env.MONGO_URI, {})
.then(() => console.log('MongoDB Connected...')) // Success message
.catch(err => console.error('MongoDB Connection Error:', err)); // Error message

// --- API Routes ---
// Directs any requests starting with /api/auth to the routes defined in auth.js
app.use('/api/auth', require('./routes/auth'));

// Directs any requests starting with /api/furniture to the routes defined in furniture.js
app.use('/api/furniture', require('./routes/furniture'));

// --- Start the Server ---
// Uses the port specified by Render (process.env.PORT) or defaults to 5000 for local development
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
