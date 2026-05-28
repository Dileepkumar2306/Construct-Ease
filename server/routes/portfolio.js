const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PortfolioItem = require('../models/PortfolioItem');

// GET /api/portfolio - Get portfolio items (filtered by role/category if provided)
router.get('/', async (req, res) => {
    try {
        const { role, category } = req.query;
        const filter = {};
        if (role) filter.role = role;
        if (category) filter.category = category;

        let items = [];
        if (mongoose.connection.readyState === 1) {
            items = await PortfolioItem.find(filter).sort({ createdAt: -1 });
        } else {
            // Default mock items if DB not connected
            items = getMockItems(role);
        }
        res.json(items);
    } catch (err) {
        console.error("Error fetching portfolio items:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/portfolio - Create a new portfolio item
router.post('/', async (req, res) => {
    try {
        const { title, description, role, category, imageUrl, author } = req.body;
        if (!title || !description || !role || !category || !imageUrl) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newItemData = { title, description, role, category, imageUrl, author: author || 'Anonymous' };

        let savedItem;
        if (mongoose.connection.readyState === 1) {
            const item = new PortfolioItem(newItemData);
            savedItem = await item.save();
        } else {
            savedItem = { ...newItemData, _id: 'mock_' + Math.random().toString(36).substr(2, 9), createdAt: new Date() };
        }

        res.status(201).json(savedItem);
    } catch (err) {
        console.error("Error saving portfolio item:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// PUT /api/portfolio/:id - Update an existing portfolio item
router.put('/:id', async (req, res) => {
    try {
        const { title, description, role, category, imageUrl, author } = req.body;
        const itemId = req.params.id;

        if (mongoose.connection.readyState === 1) {
            const item = await PortfolioItem.findById(itemId);
            if (!item) {
                return res.status(404).json({ error: "Portfolio item not found" });
            }

            if (title !== undefined) item.title = title;
            if (description !== undefined) item.description = description;
            if (role !== undefined) item.role = role;
            if (category !== undefined) item.category = category;
            if (imageUrl !== undefined) item.imageUrl = imageUrl;
            if (author !== undefined) item.author = author;

            const updatedItem = await item.save();
            res.json(updatedItem);
        } else {
            res.json({ _id: itemId, title, description, role, category, imageUrl, author });
        }
    } catch (err) {
        console.error("Error updating portfolio item:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// DELETE /api/portfolio/:id - Delete a portfolio item
router.delete('/:id', async (req, res) => {
    try {
        const itemId = req.params.id;
        if (mongoose.connection.readyState === 1) {
            const item = await PortfolioItem.findByIdAndDelete(itemId);
            if (!item) {
                return res.status(404).json({ error: "Portfolio item not found" });
            }
            res.json({ message: "Portfolio item deleted successfully", id: itemId });
        } else {
            res.json({ message: "Portfolio item deleted successfully (mock)", id: itemId });
        }
    } catch (err) {
        console.error("Error deleting portfolio item:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Helper function for default mock items when DB is not connected
function getMockItems(role) {
    const allMocks = [
        {
            _id: "mock1",
            title: "Modern 3BHK Eco-Villa Design",
            description: "A beautiful architectural floor plan and 3D rendering featuring sustainable solar panels, cross-ventilation, and smart home control systems.",
            role: "architect",
            category: "design",
            imageUrl: "/assets/images/template1.png",
            author: "Ar. Raghav Rao",
            createdAt: new Date()
        },
        {
            _id: "mock2",
            title: "Skyline Premium Towers",
            description: "Ongoing high-rise structure featuring advanced structural steel frames and earthquake-resistant designs. Floor 12 currently in casting phase.",
            role: "builder",
            category: "construction",
            imageUrl: "/assets/images/high_rise.png",
            author: "Elite Construction Builders",
            createdAt: new Date()
        },
        {
            _id: "mock3",
            title: "Scandinavian Minimalist Living Room",
            description: "A cozy living space designed using neutral palettes, light oak flooring, natural textures, and micro-led ambient lighting.",
            role: "interior",
            category: "interior_design",
            imageUrl: "/assets/images/luxury_villa.png",
            author: "Heritage Craft Interiors",
            createdAt: new Date()
        },
        {
            _id: "mock4",
            title: "My Dream Kitchen Inspiration",
            description: "Saved layout with dual kitchen island, brass fittings, and navy blue shaker cabinets.",
            role: "customer",
            category: "idea",
            imageUrl: "/assets/images/urban_house.png",
            author: "House Owner",
            createdAt: new Date()
        }
    ];

    if (role) {
        return allMocks.filter(m => m.role === role);
    }
    return allMocks;
}

module.exports = router;
