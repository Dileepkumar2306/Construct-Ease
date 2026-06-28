const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Template = require('../models/Template');
const Estimate = require('../models/Estimate');
const Professional = require('../models/Professional');
const Inquiry = require('../models/Inquiry');
const BhkDetails = require('../models/BhkDetails');
const Quote = require('../models/Quote');

// GET /api/bhk-details
router.get('/bhk-details', async (req, res) => {
    try {
        let bhks = [];
        if (mongoose.connection.readyState === 1) {
            bhks = await BhkDetails.find({});
        }
        
        // Fallback mock array if database contains nothing
        if (bhks.length === 0) {
            bhks = [
                {
                    bhkType: '1BHK',
                    title: '1 BHK — Compact & Smart Living Plan',
                    areaRange: '400 - 700 Sq.Ft.',
                    duration: '4 - 6 Months',
                    rooms: [
                        { name: 'Living Room', size: '14 x 12 ft', description: 'Welcoming space with provisions for TV unit, sofa set, and natural lighting.' },
                        { name: 'Master Bedroom', size: '12 x 10 ft', description: 'Cozy bedroom layout with built-in wardrobe slots and attached window ventilation.' },
                        { name: 'Kitchen', size: '8 x 8 ft', description: 'L-shaped granite countertop platform with sink and gas outlet.' },
                        { name: 'Bathroom', size: '7 x 5 ft', description: 'Equipped with standard sanitary ware, water heater provisions, and anti-skid tiling.' }
                    ],
                    materials: {
                        cement: '320 Bags',
                        steel: '2.5 Tons',
                        sand: '780 CFT (Cubic Feet)',
                        aggregate: '920 CFT',
                        bricks: '6,200 Pcs'
                    },
                    specifications: [
                        'Vitrified tile flooring (2x2 ft) in all rooms.',
                        'Flush doors with teak wood frames for main entrance.',
                        'UPVC sliding windows with safety grills.',
                        'Single-phase electrical connection with 25 modular switch points.'
                    ]
                },
                {
                    bhkType: '2BHK',
                    title: '2 BHK — Comfort & Family Lifestyle Plan',
                    areaRange: '800 - 1200 Sq.Ft.',
                    duration: '6 - 8 Months',
                    rooms: [
                        { name: 'Living & Dining Room', size: '18 x 12 ft', description: 'Generous area designed for family gatherings, TV setup, and 6-seater dining table.' },
                        { name: 'Master Bedroom', size: '14 x 12 ft', description: 'Spacious room with attached balcony and modern master bath suite.' },
                        { name: 'Kids Bedroom', size: '12 x 10 ft', description: 'Perfect room layout for kids or home-office setup with study alcove.' },
                        { name: 'Kitchen', size: '10 x 8 ft', description: 'Parallel modular platform layout with utility area for washing machine.' },
                        { name: 'Common Bath & Toilet', size: '7 x 5 ft', description: 'Conveniently accessible bath with anti-skid ceramic tiles.' }
                    ],
                    materials: {
                        cement: '520 Bags',
                        steel: '4.5 Tons',
                        sand: '1,300 CFT (Cubic Feet)',
                        aggregate: '1,600 CFT',
                        bricks: '11,000 Pcs'
                    },
                    specifications: [
                        'Double-charged vitrified tile flooring in living & bedrooms.',
                        'Pre-laminated flush doors and teak wood main door.',
                        '3-track aluminum sliding windows with mosquito mesh.',
                        'AC provisions in Master Bedroom, 45 electrical points.'
                    ]
                },
                {
                    bhkType: '3BHK',
                    title: '3 BHK — Elite & Spacious Premium Plan',
                    areaRange: '1200 - 1800 Sq.Ft.',
                    duration: '8 - 10 Months',
                    rooms: [
                        { name: 'Spacious Living Room', size: '20 x 14 ft', description: 'Grand lounge area overlooking balcony, ideal for L-shaped sofas and entertainment console.' },
                        { name: 'Master Bedroom Suite', size: '15 x 12 ft', description: 'Luxury suite featuring walk-in wardrobe, wooden flooring, and private balcony.' },
                        { name: 'Parents Bedroom', size: '13 x 11 ft', description: 'Comfortable double bedroom layout with attached modular bathroom.' },
                        { name: 'Guest Bedroom', size: '12 x 10 ft', description: 'Versatile room layout with sliding wardrobe slot and large windows.' },
                        { name: 'Modular Kitchen & Utility', size: '12 x 8 ft', description: 'Modern kitchen space with chimney provision and washing machine wash area.' }
                    ],
                    materials: {
                        cement: '780 Bags',
                        steel: '6.8 Tons',
                        sand: '1,900 CFT (Cubic Feet)',
                        aggregate: '2,300 CFT',
                        bricks: '16,500 Pcs'
                    },
                    specifications: [
                        'Premium vitrified flooring. Engineered wood flooring in Master Bedroom.',
                        'Teak wood main door and waterproof flush doors for toilets.',
                        'UPVC soundproof windows with safety grills.',
                        'Modular switches with concealed copper wiring (65+ points).'
                    ]
                },
                {
                    bhkType: '4BHK',
                    title: '4 BHK — Imperial Villa & Grand Residency Plan',
                    areaRange: '2000 - 3500 Sq.Ft.',
                    duration: '12 - 14 Months',
                    rooms: [
                        { name: 'Grand Entrance & Living', size: '22 x 15 ft', description: 'High-ceiling lounge welcoming guests with marble styling and natural skylights.' },
                        { name: 'Imperial Master Suite', size: '18 x 14 ft', description: 'Palatial bedroom with private lounge terrace, dressing room, and rain-shower bath.' },
                        { name: 'Kids Suite & Study', size: '14 x 12 ft', description: 'Large bedroom suite on the first floor with integrated study desk and storage.' },
                        { name: 'Parents Ground Suite', size: '14 x 12 ft', description: 'Elder-friendly ground floor layout with immediate access to lawns.' },
                        { name: 'Guest Suite', size: '12 x 11 ft', description: 'Quiet double bedroom on first floor for visitors.' },
                        { name: 'Gourmet Kitchen & Pantry', size: '16 x 10 ft', description: 'State-of-the-art kitchen space with separate store pantry and breakfast counter.' }
                    ],
                    materials: {
                        cement: '1,450 Bags',
                        steel: '12.5 Tons',
                        sand: '3,600 CFT (Cubic Feet)',
                        aggregate: '4,400 CFT',
                        bricks: '29,000 Pcs'
                    },
                    specifications: [
                        'Italian marble flooring in Living/Dining; laminated wooden in master bedroom.',
                        'Designer teak wood carved main door, panelled doors inside.',
                        'Double-glazed UPVC glass sliding panels for balconies.',
                        'Three-phase power connection with smart automation console provision.'
                    ]
                }
            ];
        }

        res.json(bhks);
    } catch (err) {
        console.error("Error fetching BHK details:", err);
        res.status(500).json({ error: "Server error" });
    }
});

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
            total: totalCost, // Added for frontend compatibility
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
            {
                _id: "default1",
                name: "Modern Minimalist",
                area: 1200,
                style: "Modern",
                image_url: "/assets/images/template1.png",
                bedrooms: "3",
                duration: "8 Months",
                highlights: [
                    'Premium cross-ventilation layout',
                    'Vastu-compliant entrance and kitchen positioning',
                    'Double-glazed window paneling for maximum soundproofing',
                    'Spacious modular kitchen utility area'
                ],
                materials: {
                    cement: "600 Bags",
                    steel: "5.4 Tons",
                    sand: "1620 CFT",
                    aggregate: "1980 CFT",
                    bricks: "12000 Pcs"
                }
            },
            {
                _id: "default2",
                name: "Cozy Cottage",
                area: 900,
                style: "Classic",
                image_url: "/assets/images/template2.png",
                bedrooms: "2",
                duration: "5 Months",
                highlights: [
                    'Traditional sloped shingle roof design',
                    'Vastu-compliant entrance and kitchen positioning',
                    'Cozy fireplace feature in living room',
                    'High ceiling wooden panel design'
                ],
                materials: {
                    cement: "450 Bags",
                    steel: "4.1 Tons",
                    sand: "1215 CFT",
                    aggregate: "1485 CFT",
                    bricks: "9000 Pcs"
                }
            },
            {
                _id: "default3",
                name: "Classic Luxury Villa",
                area: 3500,
                style: "Premium",
                image_url: "/assets/images/template3.png",
                bedrooms: "4",
                duration: "12 Months",
                highlights: [
                    'Grand double-height foyer entrance',
                    'Vastu-compliant entrance and kitchen positioning',
                    'Private rooftop terrace and landscaped courtyard',
                    'Engineered hardwood flooring and marble finishes'
                ],
                materials: {
                    cement: "1750 Bags",
                    steel: "15.8 Tons",
                    sand: "4725 CFT",
                    aggregate: "5775 CFT",
                    bricks: "35000 Pcs"
                }
            },
            {
                _id: "default4",
                name: "Modern High-Rise",
                area: 50000,
                style: "High-Rise Residential",
                image_url: "/assets/images/high_rise.png",
                bedrooms: "4",
                duration: "12 Months",
                highlights: [
                    'Reinforced earthquake-resistant frame construction',
                    'Vastu-compliant entrance and kitchen positioning',
                    'Premium sound insulation between apartments',
                    'Central fire protection and ventilation systems'
                ],
                materials: {
                    cement: "25000 Bags",
                    steel: "225.0 Tons",
                    sand: "67500 CFT",
                    aggregate: "82500 CFT",
                    bricks: "500000 Pcs"
                }
            },
            {
                _id: "default5",
                name: "Ultra Modern Luxury Villa",
                area: 4500,
                style: "Premium Modern",
                image_url: "/assets/images/luxury_villa.png",
                bedrooms: "4",
                duration: "12 Months",
                highlights: [
                    'Integrated infinity pool and patio deck',
                    'Vastu-compliant entrance and kitchen positioning',
                    'Smart automated climate and security console',
                    'State-of-the-art cantilever structural features'
                ],
                materials: {
                    cement: "2250 Bags",
                    steel: "20.3 Tons",
                    sand: "6075 CFT",
                    aggregate: "7425 CFT",
                    bricks: "45000 Pcs"
                }
            },
            {
                _id: "default6",
                name: "Urban Eco House",
                area: 2200,
                style: "Urban Modern",
                image_url: "/assets/images/urban_house.png",
                bedrooms: "3",
                duration: "8 Months",
                highlights: [
                    'Passive solar cooling and ventilation design',
                    'Vastu-compliant entrance and kitchen positioning',
                    'Rainwater harvesting and greywater recycling integration',
                    'Recycled steel frames and non-toxic paint finishes'
                ],
                materials: {
                    cement: "1100 Bags",
                    steel: "9.9 Tons",
                    sand: "2970 CFT",
                    aggregate: "3630 CFT",
                    bricks: "22000 Pcs"
                }
            }
        ];

        let dbTemplates = [];
        if (mongoose.connection.readyState === 1) {
            dbTemplates = await Template.find({});
        }
        
        if (dbTemplates.length > 0) {
            const allTemplates = [...dbTemplates];
            defaultTemplates.forEach(dt => {
                if (!allTemplates.some(t => t.name === dt.name)) {
                    allTemplates.push(dt);
                }
            });
            return res.json(allTemplates);
        }
        
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

        const areaNum = parseFloat(area);
        const roomCount = areaNum < 1000 ? '2' : areaNum < 2000 ? '3' : '4';
        const durationStr = areaNum < 1000 ? '5 Months' : areaNum < 2000 ? '8 Months' : '12 Months';

        const newTemplateData = {
            name,
            area: areaNum,
            style,
            image_url,
            bedrooms: roomCount,
            duration: durationStr,
            highlights: [
                'Premium cross-ventilation layout',
                'Vastu-compliant entrance and kitchen positioning',
                'Double-glazed window paneling for maximum soundproofing',
                'Spacious modular kitchen utility area'
            ],
            materials: {
                cement: Math.ceil(areaNum * 0.5) + ' Bags',
                steel: (areaNum * 0.0045).toFixed(1) + ' Tons',
                sand: Math.ceil(areaNum * 1.35) + ' CFT',
                aggregate: Math.ceil(areaNum * 1.65) + ' CFT',
                bricks: Math.ceil(areaNum * 10) + ' Pcs'
            }
        };

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

// GET /api/professionals
router.get('/professionals', async (req, res) => {
    try {
        const query = {};
        if (req.query.location) {
            query.location = { $regex: new RegExp(req.query.location, 'i') };
        }
        if (req.query.role && req.query.role !== 'All') {
            query.role = req.query.role;
        }

        let professionals = [];
        if (mongoose.connection.readyState === 1) {
            professionals = await Professional.find(query);
        }

        // Fallback to mock data if DB connection has no matching records
        if (professionals.length === 0) {
            const mockPros = [
                {
                    _id: "60c72b2f9b1d8b2badcf5001",
                    name: "Ar. Raghav Rao (Signature Arch Studios)",
                    role: "Architect",
                    location: "Banjara Hills, Hyderabad",
                    rating: 4.9,
                    experience: "12+ Years",
                    contactEmail: "raghav@signaturearch.com",
                    phone: "+91 70132 41482",
                    specialties: ["Modern", "Eco-friendly Villa"],
                    description: "Award-winning architectural studio specializing in contemporary layouts."
                },
                {
                    _id: "60c72b2f9b1d8b2badcf5002",
                    name: "Elite Construction Builders",
                    role: "Builder",
                    location: "Uppal, Hyderabad",
                    rating: 4.8,
                    experience: "15+ Years",
                    contactEmail: "projects@elitebuilders.in",
                    phone: "+91 70132 41482",
                    specialties: ["Residential Villa", "Apartments"],
                    description: "Premier infrastructure construction firm delivering high-quality turnkey residential villas."
                },
                {
                    _id: "60c72b2f9b1d8b2badcf5003",
                    name: "Heritage Craft Interiors",
                    role: "Interior Designer",
                    location: "Kukatpally, Hyderabad",
                    rating: 4.7,
                    experience: "10+ Years",
                    contactEmail: "info@heritagecraft.com",
                    phone: "+91 87654 32109",
                    specialties: ["Traditional Indian", "Modern Fusion"],
                    description: "Combining rich traditional craftsmanship with modern ergonomics to create stunning living spaces."
                }
            ];

            // Filter mocks locally
            professionals = mockPros.filter(p => {
                const matchesLoc = !req.query.location || p.location.toLowerCase().includes(req.query.location.toLowerCase());
                const matchesRole = !req.query.role || req.query.role === 'All' || p.role === req.query.role;
                return matchesLoc && matchesRole;
            });
        }

        res.json(professionals);
    } catch (err) {
        console.error("Error fetching professionals:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/inquiries
router.post('/inquiries', async (req, res) => {
    try {
        const { professionalId, clientName, clientPhone, clientEmail, projectArea, message } = req.body;
        
        if (!professionalId || !clientName || !clientPhone || !message) {
            return res.status(400).json({ error: "Missing required contact fields" });
        }

        const inquiryData = {
            professionalId: mongoose.Types.ObjectId.isValid(professionalId) ? new mongoose.Types.ObjectId(professionalId) : new mongoose.Types.ObjectId(),
            clientName,
            clientPhone,
            clientEmail: clientEmail || "",
            projectArea: parseFloat(projectArea || 0),
            message
        };

        if (mongoose.connection.readyState === 1) {
            const inquiry = new Inquiry(inquiryData);
            await inquiry.save();
        }

        res.status(201).json({ message: "Inquiry submitted successfully!", inquiry: inquiryData });
    } catch (err) {
        console.error("Error saving inquiry:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/quotes - save general quote requests to MongoDB
router.post('/quotes', async (req, res) => {
    try {
        const { clientName, clientEmail, clientPhone, serviceType, projectArea, message } = req.body;
        
        if (!clientName || !clientEmail || !clientPhone || !serviceType || !projectArea || !message) {
            return res.status(400).json({ error: "Please fill all required fields" });
        }

        const quoteData = {
            clientName,
            clientEmail,
            clientPhone,
            serviceType,
            projectArea: parseFloat(projectArea),
            message
        };

        let savedQuote;
        if (mongoose.connection.readyState === 1) {
            const newQuote = new Quote(quoteData);
            savedQuote = await newQuote.save();
            console.log("Quote saved successfully to MongoDB:", savedQuote._id);
        } else {
            savedQuote = { 
                ...quoteData, 
                _id: 'mock_quote_' + Math.random().toString(36).substr(2, 9), 
                createdAt: new Date() 
            };
            console.log("MongoDB disconnected. Generated mock quote:", savedQuote._id);
        }

        res.status(201).json({ 
            message: "Quote submitted successfully! Saved in database.", 
            quote: savedQuote 
        });
    } catch (err) {
        console.error("Error saving quote request:", err);
        res.status(500).json({ error: "Server error saving quote" });
    }
});

// GET /api/quotes - retrieve quote requests (latest first)
router.get('/quotes', async (req, res) => {
    try {
        let quotes = [];
        if (mongoose.connection.readyState === 1) {
            quotes = await Quote.find().sort({ createdAt: -1 });
        }
        res.json(quotes);
    } catch (err) {
        console.error("Error fetching quotes:", err);
        res.status(500).json({ error: "Server error retrieving quotes" });
    }
});

module.exports = router;
