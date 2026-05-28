const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true }, // e.g., "Paints", "Flooring", "Furniture"
    priceRating: { type: String, required: true }, // e.g., "$", "$$", "$$$"
    rating: { type: Number, default: 4.5 },
    description: { type: String }
});

module.exports = mongoose.model('Vendor', VendorSchema);
