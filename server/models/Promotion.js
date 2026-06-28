const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  propertyType: { type: String, required: true }, // e.g. Villa, Apartment, House
  location: { type: String, required: true },
  price: { type: Number, required: true },
  area: { type: Number, required: true },
  imageUrl: { type: String }, // Base64 or URL
  videoUrl: { type: String }, // Base64 or URL
  ownerName: { type: String, required: true },
  ownerPhone: { type: String, required: true },
  likes: { type: Number, default: 0 },
  comments: [{
    username: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Promotion', promotionSchema);
