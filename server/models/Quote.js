const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    clientEmail: {
        type: String,
        required: true,
        trim: true
    },
    clientPhone: {
        type: String,
        required: true,
        trim: true
    },
    serviceType: {
        type: String,
        required: true,
        enum: ['Construction', 'Architecture', 'Interior Design', 'Renovation', 'Other']
    },
    projectArea: {
        type: Number,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Reviewed', 'Contacted']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Quote', QuoteSchema);
