


// backend/scheduler.js

const cron = require('node-cron');
const { spawn } = require('child_process');
const path = require('path');
const { fetchStartingGrid } = require('./services/fetchGrid');
const Race = require('./models/Race');

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
    const today = new Date().toISOString().slice(0, 10);
    const pastRaces = schedule.filter(r => r.date <= today);
    return pastRaces.length ? pastRaces[pastRaces.length - 1] : null;

//   const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
//   return schedule.find(r => r.date >= today) || null;
}

// Schedule: every Saturday at 18:00 Toronto time
cron.schedule('0 18 * * SAT', async () => {
  console.log('[Scheduler] Saturday grid fetch starting...');
  try {
    const season = new Date().getFullYear().toString();
    const schedule = await getSchedule(season);
    console.log('[Scheduler] Season schedule loaded.');

    const next = getNextRace(schedule);
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

// Export functions for testing
module.exports = { getSchedule, getNextRace };