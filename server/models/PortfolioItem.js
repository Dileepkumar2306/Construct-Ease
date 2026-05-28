const mongoose = require('mongoose');

const PortfolioItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    role: { type: String, required: true }, // 'builder', 'architect', 'interior', 'customer'
    category: { type: String, required: true }, // 'construction', 'design', 'interior_design', 'idea'
    imageUrl: { type: String, required: true }, // Image file Base64 or URL
    author: { type: String, default: 'Anonymous' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PortfolioItem', PortfolioItemSchema);
