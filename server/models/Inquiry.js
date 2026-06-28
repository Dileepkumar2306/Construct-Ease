const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema({
    professionalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Professional',
        required: true
    },
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    clientPhone: {
        type: String,
        required: true,
        trim: true
    },
    clientEmail: {
        type: String,
        trim: true
    },
    projectArea: {
        type: Number,
        default: 0
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Inquiry', InquirySchema);
