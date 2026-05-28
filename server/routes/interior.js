const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const InteriorEstimate = require('../models/InteriorEstimate');
const Vendor = require('../models/Vendor');
const Professional = require('../models/Professional');

// POST /api/interior/estimate
router.post('/estimate', async (req, res) => {
    try {
        const area = parseFloat(req.body.area || 0);
        const quality = req.body.quality || 'standard';
        const style = req.body.style || 'modern';

        const baseRates = {
            'budget': 800,
            'standard': 1200,
            'premium': 2000
        };

        const rate = baseRates[quality] || 1200;
        
        // Style multipliers
        const styleMultiplier = {
            'minimalist': 0.9,
            'modern': 1.0,
            'classic': 1.15,
            'luxury': 1.4
        };
        
        const multiplier = styleMultiplier[style] || 1.0;
        
        const totalCost = area * rate * multiplier;

        const paintingCost = totalCost * 0.15;
        const flooringCost = totalCost * 0.25;
        const furnitureCost = totalCost * 0.40;
        const lightingCost = totalCost * 0.20;

        const estimateData = {
            area,
            style,
            quality,
            totalCost,
            breakdown: {
                painting: paintingCost,
                flooring: flooringCost,
                furniture: furnitureCost,
                lighting: lightingCost
            }
        };

        if (mongoose.connection.readyState === 1) {
            const newEstimate = new InteriorEstimate(estimateData);
            await newEstimate.save();
        }

        res.json(estimateData);
    } catch (err) {
        console.error("Error saving interior estimate:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/interior/vendors
router.get('/vendors', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const vendors = await Vendor.find({});
            return res.json(vendors);
        }
        res.json([]);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/interior/professionals
router.get('/professionals', async (req, res) => {
    try {
        // Option to filter by location: ?location=CityName
        const query = {};
        if (req.query.location) {
            query.location = { $regex: new RegExp(req.query.location, 'i') };
        }
        
        if (mongoose.connection.readyState === 1) {
            const professionals = await Professional.find(query);
            return res.json(professionals);
        }
        res.json([]);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
