const express = require('express');
const { fetchStartingGrid } = require('../services/fetchGrid');
const router = express.Router();

// GET /api/grid/:season/:gp
router.get('/:season/:gp', async (req, res) => {
  try {
    const { season, gp } = req.params;
    // e.g. gp = "Miami"  (match your Python arg)
    const grid = await fetchStartingGrid(season, gp);
    res.json(grid);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
