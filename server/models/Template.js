const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    area: { type: Number, required: true },
    style: { type: String, required: true },
    image_url: { type: String, required: true }
});

module.exports = mongoose.model('Template', TemplateSchema);
