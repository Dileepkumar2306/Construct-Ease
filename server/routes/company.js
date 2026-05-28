const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Company = require('../models/Company');

// Get all promoted companies
router.get('/', async (req, res) => {
    try {
        let companies = [];
        if (mongoose.connection.readyState === 1) {
            companies = await Company.find();
        }
        
        // If DB has no companies, return some dummy data so the UI has something to show
        if (companies.length === 0) {
            companies = [
                {
                    _id: 'dummy1',
                    name: 'Elite Construction Builders',
                    description: 'We build your dreams with quality and perfection. Top-rated infrastructure development and remodeling company.',
                    background_image: '/assets/images/company-bg.jpg',
                    logo: '/assets/images/logo1.png',
                    posters: ['/assets/images/poster1.jpg', '/assets/images/poster2.jpg'],
                    projects: [
                        { name: 'Skyline Towers', description: 'Luxury apartments in the heart of the city', image: '/assets/images/project1.jpg' },
                        { name: 'Eco-Friendly Villa', description: 'Sustainable design with modern aesthetics', image: '/assets/images/project2.jpg' }
                    ],
                    designs: ['/assets/images/design1.jpg', '/assets/images/design2.jpg'],
                    ratings: [
                        { user: 'John D.', rating: 5, review: 'Excellent work and timely delivery!', date: new Date() },
                        { user: 'Sarah M.', rating: 4, review: 'Great designs, very professional.', date: new Date() }
                    ],
                    averageRating: 4.5
                }
            ];
        }
        
        res.json(companies);
    } catch (err) {
        console.error("Error fetching companies:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Add a review/rating to a company
router.post('/:id/review', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(400).json({ error: "Database not connected" });
        }
        const { user, rating, review } = req.body;
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }
        
        company.ratings.push({ user, rating, review });
        
        // Recalculate average rating
        const totalRating = company.ratings.reduce((acc, curr) => acc + curr.rating, 0);
        company.averageRating = totalRating / company.ratings.length;
        
        await company.save();
        res.json(company);
    } catch (err) {
        console.error("Error adding review:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
