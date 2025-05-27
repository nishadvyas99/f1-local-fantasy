// backend/testScheduler.js

/**
 * A simple script to test the scheduler utilities:
 *  - getSchedule
 *  - getNextRace
 *  - fetchStartingGrid
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { getSchedule, getNextRace } = require('./scheduler');
const { fetchStartingGrid } = require('../backend/services/fetchGrid');
const { fetchRaceResults } = require('../backend/services/fetchResult')
const Race = require('./models/Race');

async function test() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected');

    // Determine current season
    const season = new Date().getFullYear().toString();

    // Fetch the full season schedule
    const schedule = await getSchedule(season);
    console.log('📅 Season schedule:', schedule);

    // Determine the next race from the schedule
    const next = getNextRace(schedule);
    if (!next) {
      console.log('⚠️  No upcoming race found in schedule.');
      process.exit(0);
    }
    console.log('🏁 Upcoming race:', next);

    // Fetch the starting grid for that race
    const grid = await fetchStartingGrid(season, next.raceName);
    console.log('📋 Fetched starting grid:', grid);

    // Upsert into Race model for verification
    const updatedRace = await Race.findOneAndUpdate(
      { season: Number(season), round: next.round },
      {
        season:       Number(season),
        round:        next.round,
        raceName:     next.raceName,
        startingGrid: grid,
        updatedAt:    new Date()
      },
      { upsert: true, new: true }
    );
    console.log('💾 Race document upserted:', updatedRace);

    // Fetch and upsert the race results
    const results = await fetchRaceResults(season, next.raceName);
    console.log('🏁 Fetched race results:', results);

    raceDoc = await Race.findOneAndUpdate(
      { season: Number(season), round: next.round },
      { results, updatedAt: new Date() },
      { new: true }
    );
    console.log('💾 Race document after results upsert:', raceDoc);

    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

test();