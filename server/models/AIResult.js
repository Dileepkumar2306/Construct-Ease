const mongoose = require('mongoose');

const AIResultSchema = new mongoose.Schema({
    feature: {
        type: String,
        enum: ['cost-estimate', 'contract-risk', 'room-planner', 'timeline', 'arch-recs', 'material-price'],
        required: true
    },
    input: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    output: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AIResult', AIResultSchema);
