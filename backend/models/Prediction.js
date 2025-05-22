// backend/models/Prediction.js
const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  userId: {
    type: String, // or ObjectId if you have a User model
    required: true
  },
  season: {
    type: Number,
    required: true
  },
  round: {
    type: Number,
    required: true
  },
  picks: {
    type: [String], // array of driver names in predicted order
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Optionally ensure one prediction per user per race
PredictionSchema.index({ userId: 1, season: 1, round: 1 }, { unique: true });

module.exports = mongoose.model('Prediction', PredictionSchema);