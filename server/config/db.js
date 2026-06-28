const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/construct_ease_db";

const seedProfessionals = async () => {
    const Professional = require('../models/Professional');
    try {
        const count = await Professional.countDocuments({ phone: { $exists: true } });
        if (count > 0) {
            console.log('Professionals already exist in MongoDB. Skipping seeding.');
            return;
        }
        await Professional.deleteMany({});

        const initialProfessionals = [
            // Hyderabad
            {
                name: "Ar. Raghav Rao (Signature Arch Studios)",
                role: "Architect",
                location: "Banjara Hills, Hyderabad",
                rating: 4.9,
                experience: "12+ Years",
                contactEmail: "raghav@signaturearch.com",
                phone: "+91 70132 41482",
                specialties: ["Modern", "Eco-friendly Villa", "High-Rise Residential"],
                description: "Award-winning architectural studio specializing in contemporary layouts and sustainable green designs."
            },
            {
                name: "Elite Construction Builders",
                role: "Builder",
                location: "Uppal, Hyderabad",
                rating: 4.8,
                experience: "15+ Years",
                contactEmail: "projects@elitebuilders.in",
                phone: "+91 70132 41482",
                specialties: ["Residential Villa", "Apartments", "Commercial Complex"],
                description: "Premier infrastructure construction firm delivering high-quality turnkey residential villas and commercial apartments."
            },
            {
                name: "Heritage Craft Interiors",
                role: "Interior Designer",
                location: "Kukatpally, Hyderabad",
                rating: 4.7,
                experience: "10+ Years",
                contactEmail: "info@heritagecraft.com",
                phone: "+91 87654 32109",
                specialties: ["Traditional Indian", "Modern Fusion", "Modular Kitchens"],
                description: "Combining rich traditional craftsmanship with modern ergonomics to create stunning living spaces."
            },
            {
                name: "Aura Space Designers",
                role: "Interior Designer",
                location: "Madhapur, Hyderabad",
                rating: 4.9,
                experience: "7+ Years",
                contactEmail: "contact@auraspaces.in",
                phone: "+91 96543 21098",
                specialties: ["Scandinavian", "Minimalist", "Home Office"],
                description: "Creating light, open, and decluttered interior designs inspired by modern Nordic aesthetics."
            },

            // Bangalore
            {
                name: "Vanguard Architects",
                role: "Architect",
                location: "Indiranagar, Bangalore",
                rating: 4.8,
                experience: "10+ Years",
                contactEmail: "hello@vanguard.arch",
                phone: "+91 94456 78901",
                specialties: ["Contemporary", "Glass Facades", "Smart Homes"],
                description: "Cutting-edge architectural designs incorporating smart home technology and premium steel framing."
            },
            {
                name: "Deccan Civil Works",
                role: "Builder",
                location: "Whitefield, Bangalore",
                rating: 4.9,
                experience: "20+ Years",
                contactEmail: "contact@deccancivil.com",
                phone: "+91 96003 34567",
                specialties: ["Luxury Villas", "Duplex Homes", "Gated Communities"],
                description: "Over two decades of excellence in civil construction and turnkey home building services in Bangalore."
            },
            {
                name: "Indira Interior Studio",
                role: "Interior Designer",
                location: "Koramangala, Bangalore",
                rating: 4.6,
                experience: "6+ Years",
                contactEmail: "design@indirastudio.com",
                phone: "+91 95004 45678",
                specialties: ["Luxury Modular Kitchens", "Wardrobes", "Living Room Decor"],
                description: "Bespoke interior styling and customized premium modular units for apartments and villas."
            },

            // Mumbai
            {
                name: "Apex Buildcon",
                role: "Builder",
                location: "Andheri West, Mumbai",
                rating: 4.7,
                experience: "14+ Years",
                contactEmail: "info@apexbuildcon.com",
                phone: "+91 98001 12345",
                specialties: ["Apartment Renovation", "High-rise construction"],
                description: "Delivering reliable structural work, high-rise flat modifications, and premium finishing solutions."
            },
            {
                name: "Studio Mumbai Design",
                role: "Architect",
                location: "Bandra, Mumbai",
                rating: 4.9,
                experience: "16+ Years",
                contactEmail: "projects@studiomumbai.co",
                phone: "+91 97002 23456",
                specialties: ["Luxury Penthouses", "Sea-facing Villas", "Minimalist Studio"],
                description: "Exclusive architectural consultancy and custom styling for luxury penthouses and premium residences."
            },

            // Delhi
            {
                name: "Delhi BuildTech",
                role: "Builder",
                location: "Dwarka, Delhi",
                rating: 4.6,
                experience: "11+ Years",
                contactEmail: "contact@delhibuildtech.com",
                phone: "+91 93005 56789",
                specialties: ["Independent Floors", "Basement Construction"],
                description: "Turnkey builders specialized in custom builder floors, basement design, and earthquake-proof building techniques."
            },
            {
                name: "Capital Arch Partners",
                role: "Architect",
                location: "Connaught Place, Delhi",
                rating: 4.8,
                experience: "15+ Years",
                contactEmail: "info@capitalarch.com",
                phone: "+91 92006 67890",
                specialties: ["Modernist", "Heritage Restoration", "Vastu Compliant"],
                description: "Professional architectural planning integrated with Vastu guidelines and structural safety certificates."
            }
        ];

        await Professional.insertMany(initialProfessionals);
        console.log('Successfully seeded database with Builders, Architects, and Interior Designers!');
    } catch (err) {
        console.error('Failed to seed professionals:', err);
    }
};

const seedTemplates = async () => {
    const Template = require('../models/Template');
    try {
        const incompleteTemplate = await Template.findOne({ highlights: { $exists: false } });
        if (incompleteTemplate) {
            console.log('Found incomplete templates in database. Re-seeding...');
            await Template.deleteMany({});
        } else {
            const count = await Template.countDocuments();
            if (count > 0) {
                console.log('Templates already exist in MongoDB. Skipping seeding.');
                return;
            }
        }

        const defaultTemplates = [
            {
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

        await Template.insertMany(defaultTemplates);
        console.log('Successfully seeded database with modern templates!');
    } catch (err) {
        console.error('Failed to seed templates:', err);
    }
};

const seedBhkDetails = async () => {
    const BhkDetails = require('../models/BhkDetails');
    try {
        const count = await BhkDetails.countDocuments();
        if (count > 0) {
            console.log('BhkDetails already exist in MongoDB. Skipping seeding.');
            return;
        }
        await BhkDetails.deleteMany({});

        const bhkList = [
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

        await BhkDetails.insertMany(bhkList);
        console.log('Successfully seeded database with BHK configurations!');
    } catch (err) {
        console.error('Failed to seed BHK details:', err);
    }
};

const seedPromotions = async () => {
    const Promotion = require('../models/Promotion');
    try {
        const count = await Promotion.countDocuments();
        if (count > 0) {
            const landCount = await Promotion.countDocuments({ propertyType: "Land" });
            if (landCount === 0) {
                console.log('No Land promotion found in DB. Seeding default Land promotion...');
                await Promotion.create({
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
                });
            } else {
                console.log('Promotions already exist in MongoDB. Skipping seeding.');
            }
            return;
        }

        const defaultPromos = [
            {
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
        await Promotion.insertMany(defaultPromos);
        console.log('Successfully seeded database with default promotions!');
    } catch (err) {
        console.error('Failed to seed promotions:', err);
    }
};

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB cluster connected successfully!');
        await seedProfessionals();
        await seedTemplates();
        await seedBhkDetails();
        await seedPromotions();
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        // Continue instead of process.exit(1) so backend runs with mocked data
    }
};

module.exports = connectDB;
