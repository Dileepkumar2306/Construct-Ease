const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Promotion = require('../models/Promotion');

// Helper for default promotions
const getDefaultPromotions = () => [
    {
        _id: "default_promo1",
        title: "GK Luxury Villa & Penthouse",
        description: "Exquisite 4BHK duplex villa featuring imported Italian marble, modular kitchen, a private rooftop swimming pool, landscaped gardens, and smart voice automation systems.",
        propertyType: "Villa",
        location: "Jubilee Hills, Hyderabad",
        price: 45000000,
        area: 4200,
        imageUrl: "/assets/images/template3.png",
        videoUrl: "",
        ownerName: "GK Luxury Company",
        ownerPhone: "7013241482",
        likes: 128,
        createdAt: new Date("2026-05-28T00:00:00Z")
    },
    {
        _id: "default_promo2",
        title: "Prestige High-Rise Apartments",
        description: "Spacious 3BHK premium apartment on the 24th floor offering panoramic city views. Multi-level car parking, clubhouse access, indoor gym, and round-the-clock power backup.",
        propertyType: "Apartment",
        location: "Uppal, Hyderabad",
        price: 18500000,
        area: 2200,
        imageUrl: "/assets/images/high_rise.png",
        videoUrl: "",
        ownerName: "Elite Construction Builders",
        ownerPhone: "7013241482",
        likes: 84,
        createdAt: new Date("2026-05-28T00:00:00Z")
    },
    {
        _id: "default_promo3",
        title: "Premium Construction Plot in Uppal",
        description: "East-facing 300 Sq.Yards (2700 Sq.Ft.) premium residential plot with direct 40ft wide road access. GHMC approved layout, fully cleared titles, ready for immediate construction. Excellent location near metro station.",
        propertyType: "Land",
        location: "Uppal, Hyderabad",
        price: 13500000,
        area: 2700,
        imageUrl: "/assets/images/urban_house.png",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-drone-shot-of-a-green-field-and-trees-40431-large.mp4",
        ownerName: "Kondal Chowdary",
        ownerPhone: "7013241482",
        likes: 42,
        createdAt: new Date("2026-06-01T00:00:00Z")
    }
];

// GET /api/promotions - Get all promotions
router.get('/', async (req, res) => {
    try {
        let promotions = [];
        if (mongoose.connection.readyState === 1) {
            promotions = await Promotion.find().sort({ createdAt: -1 });
        }
        
        if (promotions.length === 0) {
            // Return defaults if DB is empty
            return res.json(getDefaultPromotions());
        }
        res.json(promotions);
    } catch (err) {
        console.error("Error fetching promotions:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/promotions - Create a new promotion card
router.post('/', async (req, res) => {
    try {
        const { title, description, propertyType, location, price, area, imageUrl, videoUrl, ownerName, ownerPhone } = req.body;
        if (!title || !description || !propertyType || !location || !price || !area || !ownerName || !ownerPhone) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newPromoData = {
            title,
            description,
            propertyType,
            location,
            price: Number(price),
            area: Number(area),
            imageUrl,
            videoUrl,
            ownerName,
            ownerPhone,
            likes: 0
        };

        let savedPromo;
        if (mongoose.connection.readyState === 1) {
            const promo = new Promotion(newPromoData);
            savedPromo = await promo.save();
        } else {
            savedPromo = { ...newPromoData, _id: 'mock_' + Math.random().toString(36).substr(2, 9), createdAt: new Date() };
        }

        res.status(201).json(savedPromo);
    } catch (err) {
        console.error("Error saving promotion:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// PUT /api/promotions/:id - Update an existing promotion
router.put('/:id', async (req, res) => {
    try {
        const { title, description, propertyType, location, price, area, imageUrl, videoUrl, ownerName, ownerPhone } = req.body;
        const promoId = req.params.id;

        if (mongoose.connection.readyState === 1) {
            const promo = await Promotion.findById(promoId);
            if (!promo) {
                return res.status(404).json({ error: "Promotion not found" });
            }

            if (title !== undefined) promo.title = title;
            if (description !== undefined) promo.description = description;
            if (propertyType !== undefined) promo.propertyType = propertyType;
            if (location !== undefined) promo.location = location;
            if (price !== undefined) promo.price = Number(price);
            if (area !== undefined) promo.area = Number(area);
            if (imageUrl !== undefined) promo.imageUrl = imageUrl;
            if (videoUrl !== undefined) promo.videoUrl = videoUrl;
            if (ownerName !== undefined) promo.ownerName = ownerName;
            if (ownerPhone !== undefined) promo.ownerPhone = ownerPhone;

            const updatedPromo = await promo.save();
            res.json(updatedPromo);
        } else {
            res.json({ _id: promoId, title, description, propertyType, location, price, area, imageUrl, videoUrl, ownerName, ownerPhone });
        }
    } catch (err) {
        console.error("Error updating promotion:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// DELETE /api/promotions/:id - Delete a promotion
router.delete('/:id', async (req, res) => {
    try {
        const promoId = req.params.id;
        if (mongoose.connection.readyState === 1) {
            const promo = await Promotion.findByIdAndDelete(promoId);
            if (!promo) {
                return res.status(404).json({ error: "Promotion not found" });
            }
            res.json({ message: "Promotion deleted successfully", id: promoId });
        } else {
            res.json({ message: "Promotion deleted successfully (mock)", id: promoId });
        }
    } catch (err) {
        console.error("Error deleting promotion:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/promotions/:id/like - Increment the likes count
router.post('/:id/like', async (req, res) => {
    try {
        const promoId = req.params.id;
        if (mongoose.connection.readyState === 1) {
            // Find and increment
            const promo = await Promotion.findByIdAndUpdate(
                promoId,
                { $inc: { likes: 1 } },
                { new: true }
            );
            if (!promo) {
                return res.status(404).json({ error: "Promotion not found" });
            }
            res.json(promo);
        } else {
            res.json({ _id: promoId, message: "Liked (mock)" });
        }
    } catch (err) {
        console.error("Error liking promotion:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/promotions/:id/comment - Add a comment to a promotion
router.post('/:id/comment', async (req, res) => {
    try {
        const promoId = req.params.id;
        const { username, text } = req.body;
        if (!username || !text) {
            return res.status(400).json({ error: "Username and text are required" });
        }

        if (mongoose.connection.readyState === 1) {
            const promo = await Promotion.findById(promoId);
            if (!promo) {
                return res.status(404).json({ error: "Promotion not found" });
            }
            
            promo.comments.push({ username, text, createdAt: new Date() });
            const updatedPromo = await promo.save();
            res.json(updatedPromo);
        } else {
            // Mock response
            const mockComment = { _id: 'c_' + Math.random().toString(36).substr(2, 9), username, text, createdAt: new Date() };
            res.json({ _id: promoId, comments: [mockComment] });
        }
    } catch (err) {
        console.error("Error adding comment:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
