// backend/routes/predictions.js
const express = require('express');
const router  = express.Router();
const Prediction = require('../models/Prediction');
const auth = require('../middleware/auth');

router.use(auth);
/**
 * POST /api/predictions
 * Body: { season, round, predictions: [driverName, ...] }
 */
router.post('/', async (req, res) => {
  try {
    const { season, round, predictions } = req.body;
    if (!season || !round || !Array.isArray(predictions)) {
      return res.status(400).json({ error: 'season, round and predictions array are required' });
    }

    // For now, get userId from a dummy source or req.user if you have auth
    const userId = req.user.id;

    const doc = await Prediction.findOneAndUpdate(
      { userId, season, round },
      { userId, season, round, picks: predictions, createdAt: new Date() },
      { upsert: true, new: true }
    );
    return res.json({ success: true, prediction: doc });
  } catch (err) {
    console.error('Error saving prediction:', err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Prediction already exists' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
});


/**
 * GET /api/predictions/:season/:round
 * Returns the authenticated user’s saved picks and score for a specific race.
 */
router.get('/:season/:round', async (req, res) => {
  try {
    const { season, round } = req.params;
    const pred = await Prediction.findOne({
      userId: req.user.id,
      season: Number(season),
      round:  Number(round)
    }).select('picks score season round');
    if (!pred) {
      return res.status(404).json({ error: 'Prediction not found' });
    }
    res.json(pred);
  } catch (err) {
    console.error('Error fetching prediction:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;