const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Let frontend talk to backend
app.use(cors());
// Let backend understand JSON
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
  res.send('EventEase API is running');
});

// Use port from .env or 5000 by default
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
