// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

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

// Leaderboard route
const leaderboardRouter = require('./routes/leaderboard');
app.use('/api/leaderboard', leaderboardRouter);

// fire up the schedular
require('./scheduler');

// Serve React static assets
app.use(express.static(path.join(__dirname,'..', 'client/build')));
// Fallback: serve React's index.html for any request not handled by API or static files
app.use((req, res) => {
  res.sendFile(path.join(__dirname,'..', 'client/build', 'index.html'));
});



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
