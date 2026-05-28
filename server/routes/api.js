const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Template = require('../models/Template');
const Estimate = require('../models/Estimate');

// POST /api/estimate
router.post('/estimate', async (req, res) => {
    try {
        const area = parseFloat(req.body.area || 0);
        const quality = req.body.quality || 'standard';

        const rates = {
            'budget': 1500,
            'standard': 2000,
            'premium': 3000
        };

        const rate = rates[quality] || 2000;
        const totalCost = area * rate;

        const materialCost = totalCost * 0.60;
        const laborCost = totalCost * 0.30;
        const miscCost = totalCost * 0.10;

        const estimateData = {
            area,
            quality,
            totalCost: totalCost,
            breakdown: {
                materials: materialCost,
                labor: laborCost,
                misc: miscCost
            }
        };

        // Save to MongoDB if connected
        if (mongoose.connection.readyState === 1) {
            const newEstimate = new Estimate(estimateData);
            await newEstimate.save();
            console.log("Estimate saved to MongoDB!");
        }

        res.json(estimateData);
    } catch (err) {
        console.error("Error saving estimate:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/templates
router.get('/templates', async (req, res) => {
    try {
        const defaultTemplates = [
            { _id: "default1", name: "Modern Minimalist", area: 1200, style: "Modern", image_url: "/assets/images/template1.png" },
            { _id: "default2", name: "Cozy Cottage", area: 900, style: "Classic", image_url: "/assets/images/template2.png" },
            { _id: "default3", name: "Classic Luxury Villa", area: 3500, style: "Premium", image_url: "/assets/images/template3.png" },
            { _id: "default4", name: "Modern High-Rise", area: 50000, style: "High-Rise Residential", image_url: "/assets/images/high_rise.png" },
            { _id: "default5", name: "Ultra Modern Luxury Villa", area: 4500, style: "Premium Modern", image_url: "/assets/images/luxury_villa.png" },
            { _id: "default6", name: "Urban Eco House", area: 2200, style: "Urban Modern", image_url: "/assets/images/urban_house.png" }
        ];

        let dbTemplates = [];
        if (mongoose.connection.readyState === 1) {
            dbTemplates = await Template.find({});
        }
        
        if (dbTemplates.length > 0) {
            // Merge DB templates with our new realistic ones, avoiding duplicates by name
            const allTemplates = [...dbTemplates];
            defaultTemplates.forEach(dt => {
                if (!allTemplates.some(t => t.name === dt.name)) {
                    allTemplates.push(dt);
                }
            });
            return res.json(allTemplates);
        }
        
        // Return mocks if no templates found in DB
        res.json(defaultTemplates);
    } catch (err) {
        console.error("Error fetching templates:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/templates
router.post('/templates', async (req, res) => {
    try {
        const { name, area, style, image_url } = req.body;
        if (!name || !area || !style || !image_url) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newTemplateData = { name, area: parseFloat(area), style, image_url };

        let savedTemplate;
        if (mongoose.connection.readyState === 1) {
            const template = new Template(newTemplateData);
            savedTemplate = await template.save();
        } else {
            savedTemplate = { ...newTemplateData, _id: 'mock_' + Math.random().toString(36).substr(2, 9) };
        }

        res.status(201).json(savedTemplate);
    } catch (err) {
        console.error("Error saving template:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// DELETE /api/templates/:id
router.delete('/templates/:id', async (req, res) => {
    try {
        const templateId = req.params.id;
        if (mongoose.connection.readyState === 1) {
            const template = await Template.findByIdAndDelete(templateId);
            if (!template) {
                return res.status(404).json({ error: "Template not found" });
            }
            res.json({ message: "Template deleted successfully", id: templateId });
        } else {
            res.json({ message: "Template deleted successfully (mock)", id: templateId });
        }
    } catch (err) {
        console.error("Error deleting template:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
