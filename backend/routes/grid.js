const express = require('express');
const router  = express.Router();
const Race    = require('../models/Race');

/**
 * GET /api/races
 * Returns a list of all races that have a startingGrid in the DB.
 * Response: [{ season, round, raceName }, …]
 */
router.get('/', async (req, res) => {
  try {
    const docs = await Race.find({}, 'season round raceName')
                           .sort({ season: 1, round: 1 });
    res.json(docs);
  } catch (err) {
    console.error('Error fetching races:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/races/:season/:round/grid
 * Returns the stored startingGrid array for one race.
 */
router.get('/:season/:round/grid', async (req, res) => {
  const { season, round } = req.params;
  try {
    const race = await Race.findOne({
      season: Number(season),
      round:  Number(round)
    });
    if (!race) {
      return res.status(404).json({ error: 'Race not found' });
    }
    res.json(race.startingGrid);
  } catch (err) {
    console.error('Error fetching grid:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
