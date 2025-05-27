// backend/services/scorePredictions.js

const mongoose   = require('mongoose');
const Race       = require('../models/Race');
const Prediction = require('../models/Prediction');
require('dotenv').config();

/**
 * Connects to MongoDB, scores every Prediction against its Race.results,
 * awards 2 points for exact, 1 point for off-by-one, and saves `score`.
 */
async function scoreAllPredictions() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true
  });
  console.log('✅ Connected to MongoDB for scoring');

  const predictions = await Prediction.find({});
  for (const pred of predictions) {
    const race = await Race.findOne({
      season: pred.season,
      round:  pred.round
    });
    if (!race) {
      console.warn(`⚠️  No Race doc for ${pred.season}/${pred.round}, skipping`);
      continue;
    }

    let total = 0;
    // For each pick, compare with actual results
    pred.picks.forEach((driver, i) => {
      const predictedPos = i + 1;
      const actual = race.results.find(r => r.driver === driver);
      if (!actual) return;
      const actualPos = parseInt(actual.position, 10);
      const diff      = Math.abs(predictedPos - actualPos);
      if (diff === 0) total += 2;
      else if (diff === 1) total += 1;
    });

    await Prediction.updateOne(
    { _id: pred._id },
    { $set: { score: total } }
    );
    console.log(`🏅 Prediction ${pred._id} scored ${total} points`);
  }

  await mongoose.disconnect();
  console.log('🏁 Scoring complete—disconnected from MongoDB');
}

// Export for manual or scheduled invocation
module.exports = { scoreAllPredictions };

// If you run this file directly (e.g. `node services/scorePredictions.js`), invoke it:
if (require.main === module) {
  scoreAllPredictions()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

