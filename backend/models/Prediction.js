// backend/models/Prediction.js

const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  userId:    { type: String, required: true },
  season:    { type: Number, required: true },
  round:     { type: Number, required: true },
  picks:     { type: [String], required: true },
  score:     { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

// Ensure one prediction per user per race
PredictionSchema.index({ userId: 1, season: 1, round: 1 }, { unique: true });

module.exports = mongoose.model('Prediction', PredictionSchema);