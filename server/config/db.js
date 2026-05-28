const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/construct_ease_db";

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB cluster connected successfully!');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        // Continue instead of process.exit(1) so backend runs with mocked data
    }
};

module.exports = connectDB;
