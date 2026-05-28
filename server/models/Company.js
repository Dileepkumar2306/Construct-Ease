const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  background_image: { type: String },
  logo: { type: String },
  posters: [{ type: String }],
  projects: [{
    name: String,
    description: String,
    image: String
  }],
  designs: [{ type: String }],
  ratings: [{
    user: String,
    rating: Number,
    review: String,
    date: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 }
});

module.exports = mongoose.model('Company', companySchema);
