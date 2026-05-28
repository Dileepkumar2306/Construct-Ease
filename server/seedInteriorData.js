const mongoose = require('mongoose');
const Vendor = require('./models/Vendor');
const Professional = require('./models/Professional');
const connectDB = require('./config/db');

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing
        await Vendor.deleteMany({});
        await Professional.deleteMany({});

        // Mock Vendors
        const vendors = [
            { name: "Luxe Stone & Tile", location: "Downtown City", category: "Flooring", priceRating: "$$$", rating: 4.8, description: "Premium imported marble and ceramics." },
            { name: "Budget Builders Supply", location: "North Suburbs", category: "General", priceRating: "$", rating: 4.2, description: "Affordable building materials and paint." },
            { name: "EcoWood Furniture Co.", location: "Westside District", category: "Furniture", priceRating: "$$", rating: 4.6, description: "Sustainable and modern wooden furniture." },
            { name: "Bright Light Fixtures", location: "East End", category: "Lighting", priceRating: "$$", rating: 4.5, description: "Modern and smart lighting solutions." },
            { name: "Color Splash Paints", location: "Southside", category: "Paints", priceRating: "$", rating: 4.4, description: "Wide variety of vibrant and durable interior paints." }
        ];

        // Mock Professionals
        const professionals = [
            { name: "Sarah Jenkins", role: "Interior Designer", location: "Downtown City", rating: 4.9, experience: "10+ Years", contactEmail: "sarah@designstudio.com" },
            { name: "Mike's Carpentry", role: "Carpenter", location: "North Suburbs", rating: 4.7, experience: "15+ Years", contactEmail: "mike@carpentry.net" },
            { name: "Elena Rodriguez", role: "Interior Designer", location: "Westside District", rating: 4.6, experience: "5+ Years", contactEmail: "elena.r@moderninteriors.com" },
            { name: "QuickFix Electricians", role: "Electrician", location: "East End", rating: 4.8, experience: "8+ Years", contactEmail: "info@quickfixelec.com" }
        ];

        await Vendor.insertMany(vendors);
        await Professional.insertMany(professionals);

        console.log("Database seeded successfully with interior vendors and professionals!");
        process.exit();
    } catch (err) {
        console.error("Error seeding data:", err);
        process.exit(1);
    }
};

seedData();
