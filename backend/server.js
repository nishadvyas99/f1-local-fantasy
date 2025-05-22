// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware for parsing JSON
app.use(express.json());

// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);    // ← THIS mounts POST /api/auth/register

// race grid router
const gridRouter = require('./routes/grid');
app.use('/api/grid', gridRouter);

// ─── PREDICTIONS ROUTES ───────────────────
const predictionsRouter = require('./routes/predictions');
app.use('/api/predictions', predictionsRouter);


// Connect to MongoDB (replace `<your_connection_string>` accordingly)
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');

    // Start the server after successful DB connection
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));
