// backend/scheduler.js

const cron = require('node-cron');
const { spawn } = require('child_process');
const path = require('path');
const { fetchStartingGrid } = require('./services/fetchGrid');
const Race = require('./models/Race');
const { fetchRaceResults } = require('./services/fetchResult');
const Prediction = require('./models/Prediction');

/**
 * Runs the Python script to get the full season schedule via FastF1.
 * Returns a Promise resolving to an array of { round, raceName, date }.
 */
function getSchedule(season) {
  return new Promise((resolve, reject) => {
    const script = path.join(__dirname, 'scripts', 'race_info.py');
    const python = path.join(__dirname, 'scripts', 'venv', 'bin', 'python3');

    const proc = spawn(python, [script, season]);

    let out = '';
    let err = '';
    proc.stdout.on('data', chunk => out += chunk);
    proc.stderr.on('data', chunk => err += chunk);

    proc.on('close', code => {
      if (code !== 0) {
        return reject(new Error(`Python schedule script exited ${code}: ${err}`));
      }
      try {
        const schedule = JSON.parse(out);
        resolve(schedule);
      } catch (e) {
        reject(e);
      }
    });
  });
}

/**
 * Given a schedule array, returns the next race whose date >= today.
 */
function getNextRace(schedule) {
    // const today = new Date().toISOString().slice(0, 10);
    // const pastRaces = schedule.filter(r => r.date <= today);
    // return pastRaces.length ? pastRaces[pastRaces.length - 1] : null;

    const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
    return schedule.find(r => r.date >= today) || null;
}

function getPastRace(schedule) {
    const today = new Date().toISOString().slice(0, 10);
    const pastRaces = schedule.filter(r => r.date <= today);
    return pastRaces.length ? pastRaces[pastRaces.length - 1] : null;

    // const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
    // return schedule.find(r => r.date >= today) || null;
}

// Schedule: every Saturday at 18:00 Toronto time
//cron.schedule('* * * * *', async () => {
cron.schedule('40 20 * * SAT', async () => {
  console.log('[Scheduler] Saturday grid fetch starting...');
  try {
    const season = new Date().getFullYear().toString();
    const schedule = await getSchedule(season);
    console.log('[Scheduler] Season schedule loaded.');

    const next = getPastRace(schedule);
    if (!next) {
      console.log('[Scheduler] No upcoming race found in schedule.');
      return;
    }
    console.log(`[Scheduler] Next race: ${next.raceName} (Round ${next.round} on ${next.date})`);

    const grid = await fetchStartingGrid(season, next.raceName);
    console.log('[Scheduler] Fetched starting grid:', grid);

    await Race.findOneAndUpdate(
      { season: Number(season), round: next.round },
      {
        season:       Number(season),
        round:        next.round,
        raceName:     next.raceName,
        startingGrid: grid,
        updatedAt:    new Date()
      },
      { upsert: true }
    );
    console.log('[Scheduler] Starting grid saved to database.');
  } catch (err) {
    console.error('[Scheduler] Error in grid fetch job:', err);
  }
}, {
  timezone: 'America/Toronto'
});

// Schedule: every Sunday at 18:00 Toronto time to update race results
//cron.schedule('*/2 * * * *', async () => {
cron.schedule('0 18 * * SUN', async () => {
  console.log('[Scheduler] Sunday result fetch starting...');
  try {
    const season   = new Date().getFullYear().toString();
    const schedule = await getSchedule(season);
    console.log('[Scheduler] Season schedule loaded.');

    const lastRace = getPastRace(schedule);
    if (!lastRace) {
      console.log('[Scheduler] No past race found to fetch results for.');
      return;
    }
    console.log(`[Scheduler] Fetching results for: ${lastRace.raceName} (Round ${lastRace.round})`);

    // Fetch results from your service
    const results = await fetchRaceResults(season, lastRace.raceName);
    console.log('[Scheduler] Fetched race results:', results);

    // Upsert results into MongoDB
    await Race.findOneAndUpdate(
      { season: Number(season), round: lastRace.round },
      { results, updatedAt: new Date() },
      { upsert: false }
    );
    console.log('[Scheduler] Race results updated in database.');

    // 4) Score all user predictions for this race
    const preds = await Prediction.find({
      season: Number(season),
      round:  lastRace.round
    });

    for (const pred of preds) {
      let totalScore = 0;

      pred.picks.forEach((driver, idx) => {
        const predictedPos = idx + 1;
        const actualEntry  = results.find(r => r.driver === driver);
        if (!actualEntry) return;
        const actualPos = parseInt(actualEntry.position, 10);
        const diff = Math.abs(predictedPos - actualPos);
        if (diff === 0) totalScore += 2;
        else if (diff === 1) totalScore += 1;
      });

      // Update only the score field
      await Prediction.updateOne(
        { _id: pred._id },
        { $set: { score: totalScore } }
      );
      console.log(`[Scheduler] Scored Prediction ${pred._id}: ${totalScore} pts`);
    }
  } catch (err) {
    console.error('[Scheduler] Error in results fetch job:', err);
  }
}, {
  timezone: 'America/Toronto'
});



// Export functions for testing
module.exports = { getSchedule, getNextRace, getPastRace };