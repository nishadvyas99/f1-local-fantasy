// backend/routes/leaderboard.js
const express    = require('express');
const router     = express.Router();
const Prediction = require('../models/Prediction');
const User       = require('../models/User');

/**
 * GET /api/leaderboard/:season
 * Returns sorted leaderboard for the given season.
 */
router.get('/:season', async (req, res) => {
  try {
    const season = Number(req.params.season);
    const leaderboard = await Prediction.aggregate([
      { $match: { season } },
      { $group: { _id: '$userId', totalScore: { $sum: '$score' } } },
      { $addFields: { userObjectId: { $toObjectId: '$_id' } } },
      { $sort: { totalScore: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'userObjectId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id:        0,
          userId:     '$_id',
          username:   '$user.username',
          totalScore: 1
        }
      }
    ]);
    res.json(leaderboard);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;