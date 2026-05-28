const mongoose = require('mongoose');

const EstimateSchema = new mongoose.Schema({
    area: {
        type: Number,
        required: true
    },
    quality: {
        type: String,
        enum: ['budget', 'standard', 'premium'],
        default: 'standard'
    },
    totalCost: {
        type: Number,
        required: true
    },
    breakdown: {
        materials: Number,
        labor: Number,
        misc: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Estimate', EstimateSchema);
