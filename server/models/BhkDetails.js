const mongoose = require('mongoose');

const BhkDetailsSchema = new mongoose.Schema({
    bhkType: { type: String, required: true, unique: true }, // e.g. '1BHK', '2BHK', '3BHK', '4BHK'
    title: { type: String, required: true },
    areaRange: { type: String, required: true },
    duration: { type: String, required: true },
    rooms: [
        {
            name: { type: String, required: true },
            size: { type: String, required: true },
            description: { type: String, required: true }
        }
    ],
    materials: {
        cement: { type: String, required: true },
        steel: { type: String, required: true },
        sand: { type: String, required: true },
        aggregate: { type: String, required: true },
        bricks: { type: String, required: true }
    },
    specifications: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BhkDetails', BhkDetailsSchema);
