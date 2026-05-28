const mongoose = require('mongoose');

const ProfessionalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true }, // e.g., "Interior Designer", "Carpenter", "Electrician"
    location: { type: String, required: true },
    rating: { type: Number, default: 4.8 },
    experience: { type: String }, // e.g., "5+ Years"
    contactEmail: { type: String }
});

module.exports = mongoose.model('Professional', ProfessionalSchema);
