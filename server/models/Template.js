const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    area: { type: Number, required: true },
    style: { type: String, required: true },
    image_url: { type: String, required: true },
    bedrooms: { type: String },
    duration: { type: String },
    highlights: [{ type: String }],
    materials: {
        cement: { type: String },
        steel: { type: String },
        sand: { type: String },
        aggregate: { type: String },
        bricks: { type: String }
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Template', TemplateSchema);
