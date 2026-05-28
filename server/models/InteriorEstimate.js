const mongoose = require('mongoose');

const InteriorEstimateSchema = new mongoose.Schema({
    area: { type: Number, required: true },
    style: { type: String, enum: ['modern', 'classic', 'minimalist', 'luxury'], default: 'modern' },
    quality: { type: String, enum: ['budget', 'standard', 'premium'], default: 'standard' },
    totalCost: { type: Number, required: true },
    breakdown: {
        painting: Number,
        flooring: Number,
        furniture: Number,
        lighting: Number
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InteriorEstimate', InteriorEstimateSchema);
