

const mongoose = require('mongoose');

const GridEntrySchema = new mongoose.Schema({
  position: {
    type: Number,
    required: true
  },
  driver: {
    type: String,
    required: true
  }
}, { _id: false });

const ResultEntrySchema = new mongoose.Schema({
  position:   Number,
  number:     String,
  driver:     String,
  constructor: String,
  laps:       String,
  time:       String,
  grid:       String,
  points:     String
}, { _id: false });

const RaceSchema = new mongoose.Schema({
  season: {
    type: Number,
    required: true
  },
  round: {
    type: Number,
    required: true
  },
  raceName: {
    type: String,
    required: true
  },
  startingGrid: {
    type: [GridEntrySchema],
    default: []
  },
  results: {
    type: [ResultEntrySchema],
    default: []
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure uniqueness per season and round
RaceSchema.index({ season: 1, round: 1 }, { unique: true });

module.exports = mongoose.model('Race', RaceSchema);