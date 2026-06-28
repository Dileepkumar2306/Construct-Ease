const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const AIResult = require('../models/AIResult');

// ─────────────────────────────────────────────
// Helper: save result to DB if connected
// ─────────────────────────────────────────────
async function saveResult(feature, input, output) {
    try {
        if (mongoose.connection.readyState === 1) {
            await new AIResult({ feature, input, output }).save();
        }
    } catch (e) {
        console.error('AI result save error:', e.message);
    }
}

// ─────────────────────────────────────────────
// 1. AI COST ESTIMATOR
//    POST /api/ai/estimate
//    Input: { area, city, floors, quality, projectType }
//    Output: detailed breakdown with cement, steel, labor, materials
// ─────────────────────────────────────────────
router.post('/estimate', async (req, res) => {
    try {
        const { area = 1000, city = 'mumbai', floors = 1, quality = 'standard', projectType = 'residential' } = req.body;
        const sqft = parseFloat(area);
        const numFloors = parseInt(floors) || 1;

        // City-based cost multipliers (India)
        const cityMultiplier = {
            mumbai: 1.45, delhi: 1.30, bangalore: 1.25, hyderabad: 1.15,
            chennai: 1.20, pune: 1.18, ahmedabad: 1.05, kolkata: 1.10,
            jaipur: 0.95, lucknow: 0.92, default: 1.00
        };
        const cityKey = city.toLowerCase().trim();
        const cityFactor = cityMultiplier[cityKey] || cityMultiplier.default;

        // Base rates per sqft (INR) by quality
        const baseRates = { budget: 1500, standard: 2000, premium: 3000, luxury: 4500 };
        const baseRate = baseRates[quality] || 2000;

        // Floor factor (multi-storey costs more per floor)
        const floorFactor = 1 + (numFloors - 1) * 0.08;

        // Project type adjustment
        const typeFactor = { residential: 1.0, commercial: 1.15, villa: 1.25, apartment: 1.10 };
        const projFactor = typeFactor[projectType] || 1.0;

        const effectiveRate = baseRate * cityFactor * floorFactor * projFactor;
        const totalArea = sqft * numFloors;
        const totalCost = Math.round(totalArea * effectiveRate);

        // Material quantity estimates (industry standard ratios)
        const cementBags = Math.round(totalArea * 0.4);        // ~0.4 bags/sqft
        const steelKg    = Math.round(totalArea * 4.5);        // ~4.5 kg/sqft
        const sandCft    = Math.round(totalArea * 1.32);       // ~1.32 cft/sqft
        const aggregateCft = Math.round(totalArea * 2.5);      // ~2.5 cft/sqft
        const bricksCount  = Math.round(totalArea * 8);        // ~8 bricks/sqft
        const laborDays    = Math.round(totalArea * 0.25);     // ~0.25 labor-days/sqft

        // Cost breakdown
        const materialCost = Math.round(totalCost * 0.45);
        const steelCost    = Math.round(totalCost * 0.15);
        const laborCost    = Math.round(totalCost * 0.25);
        const finishingCost = Math.round(totalCost * 0.10);
        const miscCost     = Math.round(totalCost * 0.05);

        // Price per unit (current market approx)
        const cementPricePerBag = 380;
        const steelPricePerKg   = 65;

        const output = {
            summary: {
                totalCost,
                effectiveRatePerSqft: Math.round(effectiveRate),
                city: cityKey,
                quality,
                totalArea: `${totalArea} sqft`,
                floors: numFloors
            },
            materials: {
                cement: { quantity: cementBags, unit: 'bags', estimatedCost: cementBags * cementPricePerBag },
                steel:  { quantity: steelKg,    unit: 'kg',   estimatedCost: steelKg * steelPricePerKg   },
                sand:   { quantity: sandCft,     unit: 'cft'  },
                aggregate: { quantity: aggregateCft, unit: 'cft' },
                bricks: { quantity: bricksCount, unit: 'nos' }
            },
            laborDays,
            breakdown: {
                materials: materialCost,
                steel:     steelCost,
                labor:     laborCost,
                finishing: finishingCost,
                misc:      miscCost
            },
            aiInsights: [
                `Based on current ${cityKey.charAt(0).toUpperCase() + cityKey.slice(1)} market rates`,
                quality === 'premium' || quality === 'luxury'
                    ? 'Premium finishes increase cost by 30–50% but add resale value'
                    : 'Standard quality offers best value-for-money',
                numFloors > 2
                    ? 'Multi-storey structures require additional structural engineering costs'
                    : 'Ground + 1 is the most cost-efficient configuration',
                `Plan for a 10–15% contingency buffer (₹${Math.round(totalCost * 0.12).toLocaleString()})`
            ]
        };

        await saveResult('cost-estimate', req.body, output);
        res.json(output);
    } catch (err) {
        console.error('AI Estimate error:', err);
        res.status(500).json({ error: 'AI estimation failed' });
    }
});

// ─────────────────────────────────────────────
// 2. CONTRACT RISK SCANNER
//    POST /api/ai/risk-scan
//    Input: { contractText }
//    Output: array of risky clauses with severity & recommendation
// ─────────────────────────────────────────────
const riskPatterns = [
    {
        pattern: /arbitration\s*clause/gi,
        clause: 'Arbitration Clause',
        severity: 'HIGH',
        reason: 'Mandatory arbitration waives your right to a jury trial and limits legal remedies.',
        recommendation: 'Negotiate to add "mutual agreement" to arbitration, or remove it.'
    },
    {
        pattern: /unlimited\s*liability|no\s*cap\s*on\s*liability/gi,
        clause: 'Unlimited Liability',
        severity: 'HIGH',
        reason: 'You could be held responsible for any amount with no financial ceiling.',
        recommendation: 'Negotiate a liability cap equal to the total contract value.'
    },
    {
        pattern: /unilateral(ly)?\s*(amend|modify|change)/gi,
        clause: 'Unilateral Modification Right',
        severity: 'HIGH',
        reason: 'The other party can change contract terms without your consent.',
        recommendation: 'Require mutual written consent for any amendments.'
    },
    {
        pattern: /indemnif(y|ication|ied)\s*(all|any|third)/gi,
        clause: 'Broad Indemnification',
        severity: 'HIGH',
        reason: 'You may be required to pay for losses caused by third parties you don\'t control.',
        recommendation: 'Limit indemnification to losses directly caused by your negligence.'
    },
    {
        pattern: /auto(matic)?\s*renew|auto[- ]?renewal/gi,
        clause: 'Auto-Renewal Clause',
        severity: 'MEDIUM',
        reason: 'Contract renews automatically, potentially locking you in without notice.',
        recommendation: 'Add a clear 30-day opt-out notice window before renewal.'
    },
    {
        pattern: /liquidated\s*damages|penalty\s*clause/gi,
        clause: 'Liquidated Damages / Penalty',
        severity: 'MEDIUM',
        reason: 'Fixed penalties for delays or breach may exceed actual damages.',
        recommendation: 'Cap liquidated damages at 10% of contract value.'
    },
    {
        pattern: /intellectual\s*property\s*(assignment|transfer|belongs)/gi,
        clause: 'IP Ownership Transfer',
        severity: 'MEDIUM',
        reason: 'Your designs, plans or innovations may become the property of the other party.',
        recommendation: 'Retain IP ownership; grant only a usage license.'
    },
    {
        pattern: /non[- ]?compete/gi,
        clause: 'Non-Compete Clause',
        severity: 'MEDIUM',
        reason: 'Restricts your ability to work in the same field or region after contract ends.',
        recommendation: 'Limit scope to 6 months and a 10km radius, or remove entirely.'
    },
    {
        pattern: /waiver\s*of\s*(rights|claims|remedies)/gi,
        clause: 'Rights Waiver',
        severity: 'MEDIUM',
        reason: 'You may be giving up legal rights or claims without full understanding.',
        recommendation: 'Review all waivers with a legal counsel before signing.'
    },
    {
        pattern: /force\s*majeure/gi,
        clause: 'Force Majeure',
        severity: 'LOW',
        reason: 'Events like pandemics or floods may excuse non-performance — check who benefits.',
        recommendation: 'Ensure force majeure is mutual and requires timely notification.'
    },
    {
        pattern: /governing\s*law|jurisdiction/gi,
        clause: 'Governing Law / Jurisdiction',
        severity: 'LOW',
        reason: 'Disputes may need to be resolved in a court far from your location.',
        recommendation: 'Negotiate for your local jurisdiction or a neutral city.'
    },
    {
        pattern: /termination\s*(for\s*)?(convenience|any\s*reason)/gi,
        clause: 'Termination for Convenience',
        severity: 'MEDIUM',
        reason: 'The other party can terminate without cause, leaving you with no recourse.',
        recommendation: 'Ensure termination includes a notice period and compensation for work done.'
    },
    {
        pattern: /as[- ]?is|no\s*warranty|without\s*warranty/gi,
        clause: 'No Warranty / As-Is Clause',
        severity: 'HIGH',
        reason: 'Goods or services delivered without any quality guarantee.',
        recommendation: 'Demand minimum quality warranties, especially for construction materials.'
    },
    {
        pattern: /confidential(ity)?|non[- ]?disclosure/gi,
        clause: 'Confidentiality / NDA',
        severity: 'LOW',
        reason: 'Broad confidentiality can restrict sharing project details even with your advisors.',
        recommendation: 'Carve out exceptions for legal counsel and regulatory requirements.'
    },
    {
        pattern: /payment\s*within\s*(\d+)\s*days/gi,
        clause: 'Payment Timeline',
        severity: 'LOW',
        reason: 'Long payment terms may impact your cash flow significantly.',
        recommendation: 'Negotiate to 15–30 day payment terms with late payment interest.'
    }
];

router.post('/risk-scan', async (req, res) => {
    try {
        const { contractText = '' } = req.body;
        if (!contractText || contractText.trim().length < 50) {
            return res.status(400).json({ error: 'Please provide contract text (minimum 50 characters).' });
        }

        const findings = [];
        for (const rule of riskPatterns) {
            const matches = contractText.match(rule.pattern);
            if (matches) {
                // Extract surrounding context snippet
                const idx = contractText.search(rule.pattern);
                const start = Math.max(0, idx - 80);
                const end = Math.min(contractText.length, idx + 120);
                const snippet = contractText.slice(start, end).replace(/\s+/g, ' ').trim();

                findings.push({
                    clause: rule.clause,
                    severity: rule.severity,
                    reason: rule.reason,
                    recommendation: rule.recommendation,
                    snippet: `"...${snippet}..."`
                });
            }
        }

        // Risk score
        const highCount   = findings.filter(f => f.severity === 'HIGH').length;
        const mediumCount = findings.filter(f => f.severity === 'MEDIUM').length;
        const lowCount    = findings.filter(f => f.severity === 'LOW').length;
        const riskScore   = Math.min(100, highCount * 30 + mediumCount * 15 + lowCount * 5);

        let riskLevel = 'SAFE';
        if (riskScore >= 60) riskLevel = 'DANGEROUS';
        else if (riskScore >= 30) riskLevel = 'RISKY';
        else if (riskScore >= 10) riskLevel = 'MODERATE';

        const output = {
            riskScore,
            riskLevel,
            totalClauses: findings.length,
            summary: { high: highCount, medium: mediumCount, low: lowCount },
            findings,
            aiAdvice: riskLevel === 'DANGEROUS'
                ? '⚠️ This contract has multiple high-severity clauses. Do NOT sign without legal review.'
                : riskLevel === 'RISKY'
                ? '🔶 Several concerning clauses detected. Negotiate key terms before signing.'
                : riskLevel === 'MODERATE'
                ? '🟡 Minor concerns found. Review highlighted clauses carefully.'
                : '✅ No major risk clauses detected. Standard contract appears balanced.'
        };

        await saveResult('contract-risk', { textLength: contractText.length }, output);
        res.json(output);
    } catch (err) {
        console.error('Risk scan error:', err);
        res.status(500).json({ error: 'Contract analysis failed' });
    }
});

// ─────────────────────────────────────────────
// 3. AI ROOM PLANNER
//    POST /api/ai/room-planner
//    Input: { totalArea, rooms, style, floors }
//    Output: recommended room dimensions + tips
// ─────────────────────────────────────────────
router.post('/room-planner', async (req, res) => {
    try {
        const { totalArea = 1000, rooms = 3, style = 'modern', floors = 1 } = req.body;
        const area = parseFloat(totalArea);
        const roomCount = parseInt(rooms) || 3;

        // Standard room allocation percentages
        const allocations = {
            masterBedroom:  { pct: 0.18, minSqft: 150, label: 'Master Bedroom' },
            bedroom2:       { pct: 0.12, minSqft: 120, label: 'Bedroom 2'      },
            bedroom3:       { pct: 0.10, minSqft: 100, label: 'Bedroom 3'      },
            livingRoom:     { pct: 0.20, minSqft: 180, label: 'Living Room'    },
            kitchen:        { pct: 0.10, minSqft: 100, label: 'Kitchen'        },
            diningRoom:     { pct: 0.08, minSqft: 80,  label: 'Dining Room'   },
            bathrooms:      { pct: 0.06, minSqft: 50,  label: 'Bathrooms'     },
            utilityStore:   { pct: 0.04, minSqft: 40,  label: 'Utility/Store' },
            passages:       { pct: 0.08, minSqft: 60,  label: 'Passages/Lobby'},
            balconyTerrace: { pct: 0.04, minSqft: 30,  label: 'Balcony/Terrace'}
        };

        // Build room list based on bedroom count
        const roomKeys = ['livingRoom', 'kitchen', 'diningRoom', 'masterBedroom'];
        if (roomCount >= 2) roomKeys.push('bedroom2');
        if (roomCount >= 3) roomKeys.push('bedroom3');
        roomKeys.push('bathrooms', 'utilityStore', 'passages', 'balconyTerrace');

        const rooms_plan = roomKeys.map(key => {
            const room = allocations[key];
            const calcArea = Math.max(room.minSqft, Math.round(area * room.pct));
            const width    = Math.round(Math.sqrt(calcArea / 1.4) * 10) / 10;
            const length   = Math.round((calcArea / width) * 10) / 10;

            return {
                room: room.label,
                area: calcArea,
                dimensions: `${width} ft × ${length} ft`,
                furniture: getFurnitureRecs(key, style)
            };
        });

        // Style-specific tips
        const styleTips = {
            modern:      ['Opt for open-plan living + kitchen', 'Use floor-to-ceiling windows', 'Minimalist furniture with clean lines'],
            traditional: ['Separate formal living and dining rooms', 'Use warm wood tones and classic mouldings', 'Arched doorways add character'],
            contemporary:['Mix textures: concrete, glass, metal', 'Floating staircases for multi-floor homes', 'Neutral palette with bold accent wall'],
            vastu:       ['Main entrance facing East or North', 'Kitchen in South-East corner', 'Master bedroom in South-West for stability'],
            industrial:  ['Expose brick and concrete surfaces', 'Use steel-frame partitions', 'High ceilings with pendant lighting'],
            minimalist:  ['Reduce room count, maximize each space', 'Built-in storage to declutter', 'Monochrome palette with natural light']
        };

        const output = {
            summary: { totalArea: area, floors, style, bedroomCount: roomCount },
            rooms: rooms_plan,
            styleTips: styleTips[style] || styleTips.modern,
            aiInsights: [
                `For ${area} sqft, a ${roomCount}BHK is ${area / roomCount > 250 ? 'spacious' : 'compact but efficient'}`,
                `${style.charAt(0).toUpperCase() + style.slice(1)} style works best with ${style === 'modern' ? 'open layouts' : 'defined spaces'}`,
                floors > 1 ? 'Plan staircase to occupy ≤6% of total floor area' : 'Single floor maximizes accessibility and reduces structural cost'
            ]
        };

        await saveResult('room-planner', req.body, output);
        res.json(output);
    } catch (err) {
        console.error('Room planner error:', err);
        res.status(500).json({ error: 'Room planning failed' });
    }
});

function getFurnitureRecs(roomKey, style) {
    const recs = {
        masterBedroom:  ['King bed (6×6.5ft)', 'Wardrobe (6ft)', 'Dressing table', 'Bedside tables'],
        bedroom2:       ['Queen bed (5×6.5ft)', 'Wardrobe (5ft)', 'Study desk'],
        bedroom3:       ['Single/bunk beds', 'Compact wardrobe', 'Study table'],
        livingRoom:     ['3+2 sofa set', 'Coffee table', 'TV unit', 'Bookshelf'],
        kitchen:        ['L-shaped modular kitchen', 'Overhead cabinets', 'Island counter (if >120sqft)'],
        diningRoom:     ['6-seater dining table', 'Crockery unit'],
        bathrooms:      ['Wall-hung WC', 'Vanity basin', 'Shower partition'],
        utilityStore:   ['Washing machine space', 'Storage shelves'],
        passages:       ['Console table', 'Shoe rack'],
        balconyTerrace: ['2 chairs + side table', 'Planter boxes']
    };
    return recs[roomKey] || [];
}

// ─────────────────────────────────────────────
// 4. AI TIMELINE PREDICTOR
//    POST /api/ai/timeline
//    Input: { area, quality, startDate, projectType }
//    Output: construction phases with durations and milestones
// ─────────────────────────────────────────────
router.post('/timeline', async (req, res) => {
    try {
        const { area = 1000, quality = 'standard', startDate, projectType = 'residential' } = req.body;
        const sqft = parseFloat(area);

        // Base phase durations (weeks) for 1000 sqft standard
        const basePhases = [
            { name: 'Site Preparation & Foundation', icon: 'fa-shovel',          baseDays: 21 },
            { name: 'Plinth & Basement Work',        icon: 'fa-layer-group',      baseDays: 18 },
            { name: 'Superstructure / Framing',      icon: 'fa-building-columns', baseDays: 45 },
            { name: 'Roof Slab & Waterproofing',     icon: 'fa-house-chimney',    baseDays: 21 },
            { name: 'Brick / Block Masonry',         icon: 'fa-bricks',           baseDays: 30 },
            { name: 'Electrical & Plumbing Rough-in',icon: 'fa-plug-circle-bolt', baseDays: 20 },
            { name: 'Plastering & Flooring',         icon: 'fa-paint-roller',     baseDays: 35 },
            { name: 'Finishing, Paint & Handover',   icon: 'fa-flag-checkered',   baseDays: 28 }
        ];

        // Scale factor based on area
        const areaFactor = Math.pow(sqft / 1000, 0.7);

        // Quality factor
        const qualityFactor = { budget: 0.85, standard: 1.0, premium: 1.30, luxury: 1.60 };
        const qf = qualityFactor[quality] || 1.0;

        // Project type factor
        const typeFactor = { residential: 1.0, commercial: 1.25, villa: 1.15, apartment: 1.20 };
        const tf = typeFactor[projectType] || 1.0;

        let currentDate = startDate ? new Date(startDate) : new Date();
        const phases = [];

        for (const phase of basePhases) {
            const duration = Math.round(phase.baseDays * areaFactor * qf * tf);
            const endDate  = new Date(currentDate);
            endDate.setDate(endDate.getDate() + duration);

            phases.push({
                name:      phase.name,
                icon:      phase.icon,
                startDate: currentDate.toISOString().split('T')[0],
                endDate:   endDate.toISOString().split('T')[0],
                duration:  `${duration} days`,
                status:    'pending'
            });

            currentDate = new Date(endDate);
            currentDate.setDate(currentDate.getDate() + 2); // 2-day buffer between phases
        }

        const totalDays = phases.reduce((sum, p) => sum + parseInt(p.duration), 0);
        const totalMonths = Math.round(totalDays / 30);

        const output = {
            summary: {
                totalDays,
                totalMonths: `~${totalMonths} months`,
                projectStart: phases[0].startDate,
                projectedHandover: phases[phases.length - 1].endDate,
                area: sqft,
                quality
            },
            phases,
            aiInsights: [
                `Total estimated duration: ${totalMonths} months for ${sqft} sqft ${quality} construction`,
                'Monsoon season (June–September) may add 15–20% to timeline — plan accordingly',
                'Parallel tasks (electrical + plumbing rough-in) can reduce timeline by up to 2 weeks',
                'Book contractors 4–6 weeks in advance to avoid delays'
            ]
        };

        await saveResult('timeline', req.body, output);
        res.json(output);
    } catch (err) {
        console.error('Timeline error:', err);
        res.status(500).json({ error: 'Timeline prediction failed' });
    }
});

// ─────────────────────────────────────────────
// 5. ARCHITECTURE RECOMMENDER
//    POST /api/ai/arch-recs
//    Input: { budget, region, preference, plotSize }
//    Output: 3 recommended architecture styles with details
// ─────────────────────────────────────────────
const archStyles = [
    {
        style: 'Modern Minimalist',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500',
        costPerSqft: { min: 1800, max: 2500 },
        bestFor: ['urban', 'metro', 'bangalore', 'mumbai', 'delhi'],
        budgetRange: ['medium', 'high'],
        pros: ['Low maintenance', 'Maximum natural light', 'Energy efficient', 'High resale value'],
        cons: ['Less storage', 'Premium material costs', 'Requires skilled labour'],
        features: ['Open floor plans', 'Flat roofs', 'Large glass panels', 'Concrete & steel', 'Neutral palette'],
        score: 0
    },
    {
        style: 'Kerala Traditional',
        image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500',
        costPerSqft: { min: 1600, max: 2200 },
        bestFor: ['south', 'kerala', 'coastal', 'humid', 'traditional'],
        budgetRange: ['medium', 'high'],
        pros: ['Excellent ventilation', 'Cultural heritage', 'Monsoon-resistant', 'Teak wood beauty'],
        cons: ['Higher wood costs', 'Skilled craftsmen scarce', 'Longer construction time'],
        features: ['Sloped tiled roofs', 'Courtyard (Nadumuttam)', 'Wooden lattice work', 'Verandas', 'Laterite walls'],
        score: 0
    },
    {
        style: 'Contemporary Fusion',
        image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500',
        costPerSqft: { min: 2000, max: 3000 },
        bestFor: ['urban', 'metro', 'modern', 'contemporary'],
        budgetRange: ['high', 'luxury'],
        pros: ['Unique aesthetic', 'Blends tradition & modernity', 'Flexible layouts', 'Wow factor'],
        cons: ['Higher cost', 'Complex engineering', 'Requires experienced architect'],
        features: ['Mixed materials (glass + brick)', 'Floating elements', 'Green walls', 'Infinity pools', 'Smart home ready'],
        score: 0
    },
    {
        style: 'Vastu-Compliant Classic',
        image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=500',
        costPerSqft: { min: 1400, max: 2000 },
        bestFor: ['traditional', 'north', 'hindi', 'classic', 'vastu'],
        budgetRange: ['budget', 'medium'],
        pros: ['Vastu compliance', 'Cost-effective', 'Familiar construction methods', 'Strong community acceptance'],
        cons: ['Less architectural innovation', 'Rigid room placement', 'May feel dated over time'],
        features: ['East-facing entrance', 'Defined puja room', 'Courtyard', 'Flat or mild slope roof', 'Warm palette'],
        score: 0
    },
    {
        style: 'Eco-Sustainable Green Home',
        image: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=500',
        costPerSqft: { min: 2200, max: 3500 },
        bestFor: ['eco', 'green', 'sustainable', 'modern', 'premium'],
        budgetRange: ['high', 'luxury'],
        pros: ['60–70% energy savings', 'Rainwater harvesting', 'Solar integration', 'Future-proof'],
        cons: ['High upfront cost', 'Specialized contractors needed', 'Longer ROI period (5–8 yrs)'],
        features: ['Solar panels', 'Green roofs', 'Passive cooling', 'Recycled materials', 'Rain water harvest'],
        score: 0
    },
    {
        style: 'Budget Smart Home',
        image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500',
        costPerSqft: { min: 900, max: 1500 },
        bestFor: ['budget', 'affordable', 'tier2', 'tier3', 'rural'],
        budgetRange: ['budget'],
        pros: ['Lowest cost', 'Fast construction', 'Low maintenance', 'Practical layout'],
        cons: ['Limited design options', 'Basic finishes', 'Lower resale premium'],
        features: ['AAC blocks', 'Precast concrete', 'Standard fittings', 'Compact layout', 'Efficient plumbing'],
        score: 0
    }
];

router.post('/arch-recs', async (req, res) => {
    try {
        const { budget = 'medium', region = 'urban', preference = 'modern', plotSize = 1200 } = req.body;

        const budgetMap = { low: 'budget', medium: 'medium', high: 'high', luxury: 'luxury' };
        const normalizedBudget = budgetMap[budget] || 'medium';

        // Score each style
        const scored = archStyles.map(style => {
            let score = 0;
            if (style.budgetRange.includes(normalizedBudget)) score += 40;
            const regionLower = region.toLowerCase();
            const prefLower   = preference.toLowerCase();
            style.bestFor.forEach(tag => {
                if (regionLower.includes(tag) || tag.includes(regionLower)) score += 15;
                if (prefLower.includes(tag) || tag.includes(prefLower)) score += 20;
            });
            // Plot size bonus
            if (plotSize < 1000 && style.costPerSqft.min < 1600) score += 10;
            if (plotSize > 2000 && style.costPerSqft.max > 2500) score += 10;
            return { ...style, score };
        });

        // Sort and take top 3
        const top3 = scored.sort((a, b) => b.score - a.score).slice(0, 3);

        const output = {
            inputSummary: { budget, region, preference, plotSize },
            recommendations: top3.map((s, idx) => ({
                rank: idx + 1,
                style: s.style,
                image: s.image,
                matchScore: Math.min(100, s.score),
                estimatedCostPerSqft: `₹${s.costPerSqft.min}–₹${s.costPerSqft.max}`,
                totalEstimate: `₹${(plotSize * s.costPerSqft.min).toLocaleString()}–₹${(plotSize * s.costPerSqft.max).toLocaleString()}`,
                pros: s.pros,
                cons: s.cons,
                features: s.features
            })),
            aiAdvice: `Based on your ${budget} budget in ${region} with ${preference} preference, these 3 styles offer the best match for your requirements.`
        };

        await saveResult('arch-recs', req.body, output);
        res.json(output);
    } catch (err) {
        console.error('Arch recs error:', err);
        res.status(500).json({ error: 'Architecture recommendation failed' });
    }
});

// ─────────────────────────────────────────────
// 6. MATERIAL PRICE PREDICTOR
//    POST /api/ai/material-price
//    Input: { materials: ['cement', 'steel', ...] }
//    Output: current price, trend, volatility, forecast
// ─────────────────────────────────────────────
const materialData = {
    cement: {
        name: 'Cement (OPC 53 Grade)',
        unit: 'per 50kg bag',
        currentPrice: 380,
        currency: '₹',
        trend: 'stable',
        trendPct: +2.1,
        volatility: 'LOW',
        forecast30d: 385,
        forecast90d: 392,
        topBrands: ['UltraTech', 'Ambuja', 'ACC', 'Shree Cement'],
        buyTip: 'Bulk purchase (50+ bags) saves 5–8%. Buy before monsoon season.',
        icon: 'fa-industry'
    },
    steel: {
        name: 'TMT Steel Bars (Fe 500)',
        unit: 'per kg',
        currentPrice: 65,
        currency: '₹',
        trend: 'rising',
        trendPct: +4.8,
        volatility: 'HIGH',
        forecast30d: 68,
        forecast90d: 72,
        topBrands: ['TATA Tiscon', 'JSW Neosteel', 'Shyam Steel', 'Kamdhenu'],
        buyTip: 'Steel prices are rising — lock in rates now with a purchase order.',
        icon: 'fa-screwdriver-wrench'
    },
    sand: {
        name: 'River Sand (Construction Grade)',
        unit: 'per cubic feet',
        currentPrice: 55,
        currency: '₹',
        trend: 'rising',
        trendPct: +8.3,
        volatility: 'HIGH',
        forecast30d: 58,
        forecast90d: 65,
        topBrands: ['M-Sand preferred', 'River Sand', 'Quarry Sand'],
        buyTip: 'Consider M-Sand (Manufactured Sand) as a cost-effective, eco-friendly alternative.',
        icon: 'fa-mound'
    },
    bricks: {
        name: 'Red Bricks (Standard Size)',
        unit: 'per 1000 pieces',
        currentPrice: 7500,
        currency: '₹',
        trend: 'stable',
        trendPct: +1.2,
        volatility: 'LOW',
        forecast30d: 7550,
        forecast90d: 7700,
        topBrands: ['Fly Ash Bricks', 'AAC Blocks', 'Clay Bricks'],
        buyTip: 'AAC blocks cost 20% more but reduce construction time by 30% and improve insulation.',
        icon: 'fa-bricks'
    },
    paint: {
        name: 'Exterior Emulsion Paint',
        unit: 'per litre',
        currentPrice: 185,
        currency: '₹',
        trend: 'stable',
        trendPct: +0.5,
        volatility: 'LOW',
        forecast30d: 186,
        forecast90d: 190,
        topBrands: ['Asian Paints', 'Berger', 'Nerolac', 'Dulux'],
        buyTip: 'Festival season (Oct–Nov) offers 10–15% discounts on paint brands.',
        icon: 'fa-paint-roller'
    },
    tiles: {
        name: 'Vitrified Floor Tiles (600×600mm)',
        unit: 'per sq ft',
        currentPrice: 55,
        currency: '₹',
        trend: 'falling',
        trendPct: -2.3,
        volatility: 'MEDIUM',
        forecast30d: 54,
        forecast90d: 52,
        topBrands: ['Kajaria', 'Somany', 'Johnson', 'Asian Granito'],
        buyTip: 'Tile prices are falling — good time to purchase. Compare thickness (8mm vs 10mm).',
        icon: 'fa-border-all'
    },
    aggregate: {
        name: 'Coarse Aggregate (20mm)',
        unit: 'per cubic feet',
        currentPrice: 42,
        currency: '₹',
        trend: 'stable',
        trendPct: +1.5,
        volatility: 'LOW',
        forecast30d: 43,
        forecast90d: 44,
        topBrands: ['Crushed Stone', 'Gravel', 'Quarry Aggregate'],
        buyTip: 'Prices stable — buy as needed. Bulk delivery saves 3–5% on transport.',
        icon: 'fa-mountain'
    },
    plywood: {
        name: 'Commercial Plywood (18mm BWP)',
        unit: 'per sheet (8×4 ft)',
        currentPrice: 2400,
        currency: '₹',
        trend: 'rising',
        trendPct: +5.2,
        volatility: 'MEDIUM',
        forecast30d: 2520,
        forecast90d: 2650,
        topBrands: ['Century Ply', 'Greenply', 'Kitply', 'National Ply'],
        buyTip: 'Plywood prices rising due to timber costs. Pre-order for modular kitchen & furniture.',
        icon: 'fa-layer-group'
    }
};

router.post('/material-price', async (req, res) => {
    try {
        const { materials = ['cement', 'steel', 'sand', 'bricks'] } = req.body;

        const results = materials
            .map(m => m.toLowerCase().trim())
            .filter(m => materialData[m])
            .map(m => {
                const d = materialData[m];
                return {
                    key: m,
                    name: d.name,
                    unit: d.unit,
                    currentPrice: `${d.currency}${d.currentPrice}`,
                    trend: d.trend,
                    trendPct: d.trendPct,
                    volatility: d.volatility,
                    forecast: {
                        next30Days: `${d.currency}${d.forecast30d}`,
                        next90Days: `${d.currency}${d.forecast90d}`
                    },
                    topBrands: d.topBrands,
                    buyTip: d.buyTip,
                    icon: d.icon
                };
            });

        if (results.length === 0) {
            return res.status(400).json({
                error: 'No recognized materials. Try: cement, steel, sand, bricks, paint, tiles, aggregate, plywood'
            });
        }

        const output = {
            materials: results,
            marketSummary: {
                rising:  results.filter(r => r.trend === 'rising').map(r => r.key),
                falling: results.filter(r => r.trend === 'falling').map(r => r.key),
                stable:  results.filter(r => r.trend === 'stable').map(r => r.key)
            },
            aiInsight: `Currently ${results.filter(r => r.trend === 'rising').length} material(s) are rising in price. ${results.filter(r => r.volatility === 'HIGH').length > 0 ? 'High-volatility items: ' + results.filter(r => r.volatility === 'HIGH').map(r => r.key).join(', ') + '.' : 'No high-volatility items selected.'} Plan procurement accordingly.`,
            lastUpdated: new Date().toISOString().split('T')[0]
        };

        await saveResult('material-price', { materials }, output);
        res.json(output);
    } catch (err) {
        console.error('Material price error:', err);
        res.status(500).json({ error: 'Material price prediction failed' });
    }
});

router.post('/design-suggest', async (req, res) => {
    try {
        const { image, roomType = 'living-room', style = 'modern' } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'Construction photo is required' });
        }

        const suggestionsLibrary = {
            'living-room': {
                modern: {
                    colors: [
                        { name: 'Warm Alabaster', hex: '#F2EFE9', percentage: '60% (Base)', brand: 'Asian Paints Royale Luxury', description: 'Gives a spacious and clean canvas, maximizing ambient light.' },
                        { name: 'Urban Slate', hex: '#4A525A', percentage: '30% (Accent Wall)', brand: 'Asian Paints Royale Luxury', description: 'Creates a striking modern contrast behind the TV unit or sofa.' },
                        { name: 'Burnt Ochre', hex: '#C16E5A', percentage: '10% (Niches/Trims)', brand: 'Berger Silk Glamor', description: 'Injects a pop of warm energy into key design features.' }
                    ],
                    tiles: [
                        { name: 'Carara Gold Polished Vitrified', size: '800×800 mm', finish: 'High Glossy', brand: 'Kajaria Eternity', costEstimate: '₹75–₹120 / sq ft', description: 'Luxurious white marble look with gold veins to elevate the living room stature.' }
                    ],
                    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800',
                    summary: 'For a modern living room, we recommend a soft neutral backdrop paired with a bold slate accent wall. High-gloss vitrified tiles mimic Italian marble, reflecting natural light and expanding the space visually.'
                },
                minimalist: {
                    colors: [
                        { name: 'Soft Linen', hex: '#EAE6DF', percentage: '70% (Walls)', brand: 'Nerolac Impression', description: 'Calm, organic base coat that feels warm and airy.' },
                        { name: 'Warm Taupe', hex: '#B3A394', percentage: '20% (Ceiling/Niche)', brand: 'Nerolac Impression', description: 'Adds subtle depth without cluttering the visual field.' },
                        { name: 'Chalk White', hex: '#FEFCF8', percentage: '10% (Trims)', brand: 'Asian Paints Royale', description: 'Crisp highlight for windows and baseboards.' }
                    ],
                    tiles: [
                        { name: 'Satin Crema Porcelain', size: '600×1200 mm', finish: 'Matte/Satin', brand: 'Somany Slip-Shield', costEstimate: '₹60–₹85 / sq ft', description: 'Seamless beige porcelain tiles that create a calm, unified floor layout.' }
                    ],
                    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800',
                    summary: 'Minimalist spaces thrive on simplicity. We recommend muted earth tones on the walls and a matte satin floor. The focus is on clean lines and texture over high-contrast colors.'
                },
                default: {
                    colors: [
                        { name: 'Pearly White', hex: '#F6F6F6', percentage: '60% (Walls)', brand: 'Asian Paints', description: 'Bright neutral base.' },
                        { name: 'Muted Teal', hex: '#2F5C64', percentage: '30% (Accent)', brand: 'Berger Silk', description: 'A cozy, contemporary color for your main wall.' },
                        { name: 'Soft Gold', hex: '#D4AF37', percentage: '10% (Trims)', brand: 'Dulux Velvet', description: 'Elegant metallic details.' }
                    ],
                    tiles: [
                        { name: 'Classic Travertine Vitrified', size: '800×800 mm', finish: 'Polished', brand: 'Kajaria', costEstimate: '₹70–₹95 / sq ft', description: 'Timeless stone appearance suited for family gathering spaces.' }
                    ],
                    image: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=800',
                    summary: 'A versatile contemporary scheme combining clean white surfaces with a deep, sophisticated teal accent wall and high-quality travertine floor tiles.'
                }
            },
            'kitchen': {
                modern: {
                    colors: [
                        { name: 'Pure White', hex: '#FFFFFF', percentage: '50% (Walls)', brand: 'Asian Paints Royale Apcolite', description: 'Keeps the cooking area looking sanitary, bright, and hygienic.' },
                        { name: 'Charcoal Matte', hex: '#2C302E', percentage: '40% (Cabinet Background)', brand: 'Berger Silk Glamor', description: 'Stunning premium backing for modular cabinetry.' },
                        { name: 'Lime Zest', hex: '#D0F176', percentage: '10% (Accents)', brand: 'Dulux', description: 'Playful culinary highlight.' }
                    ],
                    tiles: [
                        { name: 'Marquina Black Backsplash Ceramic', size: '300×600 mm', finish: 'Super Glossy', brand: 'Kajaria Eternity', costEstimate: '₹80–₹130 / sq ft', description: 'Stunning splash protection featuring deep black marble veins.' },
                        { name: 'Anti-Skid Ash Ceramic (Floor)', size: '600×600 mm', finish: 'Matte Anti-Skid', brand: 'Somany', costEstimate: '₹55–₹75 / sq ft', description: 'Safe, moisture-resistant flooring for active kitchens.' }
                    ],
                    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800',
                    summary: 'For a modern kitchen, a high-contrast palette of white and charcoal creates a high-end feel. Slip-resistant floor tiles are essential, paired with a glossy backsplash that is easy to wipe clean.'
                },
                default: {
                    colors: [
                        { name: 'Ivory Cream', hex: '#FFFFF0', percentage: '60% (Walls)', brand: 'Nerolac', description: 'Warm and inviting.' },
                        { name: 'Warm Terracotta', hex: '#C36241', percentage: '30% (Cabinets)', brand: 'Berger', description: 'A cozy, earth-connected kitchen vibe.' },
                        { name: 'Dusty Green', hex: '#879D8E', percentage: '10% (Island)', brand: 'Dulux', description: 'A touch of nature.' }
                    ],
                    tiles: [
                        { name: 'Mediterranean Hexagonal Ceramic', size: '200×200 mm', finish: 'Satin', brand: 'Kajaria', costEstimate: '₹90–₹140 / sq ft', description: 'Charming pattern-work for kitchen walls or backsplashes.' }
                    ],
                    image: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800',
                    summary: 'A rustic-modern hybrid kitchen using warm, appetizing terracotta highlights alongside beautiful patterned hexagonal tiling.'
                }
            },
            'bedroom': {
                modern: {
                    colors: [
                        { name: 'Eco Sage Green', hex: '#7A8F7D', percentage: '50% (Behind Bed)', brand: 'Berger Breath Easy', description: 'Promotes deep relaxation and high-quality sleep.' },
                        { name: 'Muted Taupe', hex: '#9A8F80', percentage: '40% (Surrounds)', brand: 'Asian Paints Royale', description: 'Warm neutral that wraps the room in cozy comfort.' },
                        { name: 'Warm Cream', hex: '#FAF9F6', percentage: '10% (Ceiling)', brand: 'Asian Paints', description: 'Soft reflection of night lights without harsh glares.' }
                    ],
                    tiles: [
                        { name: 'Natural Oak Wood-Plank Vitrified', size: '200×1200 mm', finish: 'Textured Wooden', brand: 'Kajaria Eternity', costEstimate: '₹85–₹140 / sq ft', description: 'Provides the warmth of real hardwood flooring with the durability and cooling properties of vitrified tiles.' }
                    ],
                    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
                    summary: 'Bedrooms are sanctuaries. A soothing sage green accent wall behind the bed combined with wood-textured floor planks creates an organic, restful sanctuary.'
                },
                default: {
                    colors: [
                        { name: 'Royal Velvet', hex: '#4B3E5C', percentage: '40% (Accent)', brand: 'Asian Paints Royale', description: 'Deep, rich purple for a luxurious master bedroom feel.' },
                        { name: 'Blush Cream', hex: '#FFF2F2', percentage: '50% (Walls)', brand: 'Berger Silk', description: 'Gentle, soothing companion color.' },
                        { name: 'Soft Gold', hex: '#E6C280', percentage: '10% (Trims)', brand: 'Dulux', description: 'Elegant metallic details.' }
                    ],
                    tiles: [
                        { name: 'Statuary White Marble Vitrified', size: '800×800 mm', finish: 'High Glossy', brand: 'Somany', costEstimate: '₹75–₹110 / sq ft', description: 'Gleaming, bright, premium marble replica floors.' }
                    ],
                    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
                    summary: 'A luxurious master bedroom layout utilizing rich royal purple accents, warm ambient lighting, and white polished marble replica tiling.'
                }
            },
            'bathroom': {
                modern: {
                    colors: [
                        { name: 'Clean Mint', hex: '#E2EFE9', percentage: '40% (Ceiling & Shelving)', brand: 'Asian Paints Royale Smart', description: 'Anti-fungal formula that adds a clean, spa-like splash.' },
                        { name: 'Dark Slate', hex: '#3E4447', percentage: '60% (Feature Wall)', brand: 'Berger Silk Waterproof', description: 'Dramatically frames vanity mirrors and metallic fixtures.' }
                    ],
                    tiles: [
                        { name: 'Anti-Skid Charcoal Ceramic (Floor)', size: '300×300 mm', finish: 'Matte Anti-Slip', brand: 'Somany Slip-Shield', costEstimate: '₹50–₹70 / sq ft', description: 'Critical water-shedding tiles to prevent slips and falls.' },
                        { name: 'Calacatta White Glazed Vitrified (Walls)', size: '600×1200 mm', finish: 'Glossy', brand: 'Kajaria Eternity', costEstimate: '₹80–₹125 / sq ft', description: 'Large slab tiles that minimize grout lines, making cleaning soap scum easy.' }
                    ],
                    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
                    summary: 'Bathrooms require high functionality. We recommend large white glossy wall slabs to maximize brightness and minimize grout lines, paired with charcoal anti-slip flooring.'
                },
                default: {
                    colors: [
                        { name: 'Soft Ivory', hex: '#FFFFF0', percentage: '70% (Ceiling/Trim)', brand: 'Nerolac', description: 'Warm and bright.' },
                        { name: 'Clay Blush', hex: '#E3C1B4', percentage: '30% (Cabinetry)', brand: 'Asian Paints', description: 'Comforting, modern terracotta touch.' }
                    ],
                    tiles: [
                        { name: 'Hexagonal Terrazzo Ceramic', size: '300×300 mm', finish: 'Matte', brand: 'Kajaria', costEstimate: '₹75–₹110 / sq ft', description: 'Playful, modern terrazzo chips in a hexagonal format.' }
                    ],
                    image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800',
                    summary: 'A cozy bathroom aesthetic combining terrazzo tiling patterns with matte black brassware and clean ivory paint.'
                }
            },
            'exterior': {
                modern: {
                    colors: [
                        { name: 'Desert Sand (Weatherproof)', hex: '#D2C1B0', percentage: '60% (Main Body)', brand: 'Asian Paints Apex Ultima', description: 'Extremely durable, dust-repellent color that masks road grime.' },
                        { name: 'Deep Espresso (Weatherproof)', hex: '#3E2723', percentage: '30% (Architectural Pillars)', brand: 'Asian Paints Apex Ultima', description: 'Frames windows and columns beautifully under sunlight.' },
                        { name: 'Terracotta Rust (Weatherproof)', hex: '#C25A3F', percentage: '10% (Entry/Highlights)', brand: 'Berger WeatherCoat', description: 'Gives the main entrance a welcoming, premium identity.' }
                    ],
                    tiles: [
                        { name: 'Heavy-Duty Rustic Slate Wall Cladding', size: '150×600 mm', finish: 'Rough Stone / Textured', brand: 'Kajaria Outdoor', costEstimate: '₹95–₹150 / sq ft', description: 'Natural stone slate cladding that withstands rain, heat, and UV degradation.' }
                    ],
                    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
                    summary: 'Exterior walls require weathering protection. We recommend a dirt-repellent desert sand base color paired with natural stone slate cladding on front pillars for a luxurious street view.'
                },
                default: {
                    colors: [
                        { name: 'Granite Gray (Weatherproof)', hex: '#70777A', percentage: '60% (Facade)', brand: 'Berger WeatherCoat', description: 'Sleek, modern exterior base.' },
                        { name: 'Snow White (Weatherproof)', hex: '#F2F5F8', percentage: '30% (Borders/Trim)', brand: 'Nerolac Excel', description: 'Crisp framing highlights.' },
                        { name: 'Crimson Accent', hex: '#991B1B', percentage: '10% (Gate/Door)', brand: 'Asian Paints Apex', description: 'Bold entrance statement.' }
                    ],
                    tiles: [
                        { name: 'Rustic Terracotta Brick Cladding', size: '200×400 mm', finish: 'Textured Matt', brand: 'Somany Outdoor', costEstimate: '₹75–₹110 / sq ft', description: 'Rich brick veneers that give an industrial-modern facade.' }
                    ],
                    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
                    summary: 'A premium exterior facade combining dark granite gray paint with natural brick accent cladding to provide a strong architectural presence.'
                }
            },
            'office': {
                default: {
                    colors: [
                        { name: 'Corporate Steel', hex: '#BACAD6', percentage: '60% (Open Workspace)', brand: 'Asian Paints Professional', description: 'Keeps staff alert and neutralizes distracting reflections.' },
                        { name: 'Deep Navy Blue', hex: '#1E3A8A', percentage: '30% (Conference Accent)', brand: 'Berger Professional', description: 'Exudes confidence, trustworthiness, and corporate strength.' },
                        { name: 'Lime Bright', hex: '#84CC16', percentage: '10% (Breakroom Accent)', brand: 'Dulux Professional', description: 'Energizes creative breaks and relaxation zones.' }
                    ],
                    tiles: [
                        { name: 'Double Charge Matte Vitrified', size: '600×1200 mm', finish: 'Matte Anti-Scratch', brand: 'Kajaria Eternity', costEstimate: '₹65–₹95 / sq ft', description: 'Extremely durable, scratch-resistant floor tiles built for high foot-traffic office use.' }
                    ],
                    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
                    summary: 'For commercial environments, a highly durable scratch-resistant double-charge floor tile is essential. We pair this with calming steel-blue and confidence-boosting navy blue accents.'
                }
            }
        };

        const roomData = suggestionsLibrary[roomType] || suggestionsLibrary['living-room'];
        const selection = roomData[style] || roomData['default'] || roomData['modern'] || suggestionsLibrary['living-room']['default'];

        const output = {
            roomType,
            style,
            colors: selection.colors,
            tiles: selection.tiles,
            image: selection.image,
            summary: selection.summary,
            uploadedImage: image
        };

        await saveResult('design-suggest', { roomType, style }, output);

        res.json(output);
    } catch (err) {
        console.error('Design Suggestion error:', err);
        res.status(500).json({ error: 'Failed to generate design suggestions' });
    }
});

// ─────────────────────────────────────────────
// 7. AI MANAGEMENT DASHBOARD (Stats)
//    GET /api/ai/dashboard
// ─────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
    try {
        let stats = {
            totalAnalyses: 262,
            contractsScanned: 38,
            estimatesGenerated: 94,
            roomsPlanned: 61,
            timelinesCreated: 29,
            designsVisualized: 15,
            avgRiskScore: 42,
            recentActivity: [
                { feature: 'cost-estimate',  time: '2 min ago',  summary: '2400 sqft Premium, Mumbai' },
                { feature: 'contract-risk',  time: '15 min ago', summary: 'Risk Level: MODERATE (score 28)' },
                { feature: 'room-planner',   time: '32 min ago', summary: '3BHK Modern, 1800 sqft' },
                { feature: 'timeline',       time: '1 hr ago',   summary: 'Premium Villa, 24 months' },
                { feature: 'arch-recs',      time: '2 hrs ago',  summary: 'Contemporary Fusion recommended' }
            ]
        };

        // Override with DB data if connected
        if (mongoose.connection.readyState === 1) {
            const total = await AIResult.countDocuments();
            if (total > 0) {
                stats.totalAnalyses = total;
                stats.contractsScanned = await AIResult.countDocuments({ feature: 'contract-risk' });
                stats.estimatesGenerated = await AIResult.countDocuments({ feature: 'cost-estimate' });
                stats.roomsPlanned = await AIResult.countDocuments({ feature: 'room-planner' });
                stats.timelinesCreated = await AIResult.countDocuments({ feature: 'timeline' });
                stats.designsVisualized = await AIResult.countDocuments({ feature: 'design-suggest' });

                const recent = await AIResult.find().sort({ createdAt: -1 }).limit(5);
                if (recent.length > 0) {
                    stats.recentActivity = recent.map(r => ({
                        feature: r.feature,
                        time: timeAgo(r.createdAt),
                        summary: getSummary(r)
                    }));
                }
            }
        }

        res.json(stats);
    } catch (err) {
        console.error('Dashboard error:', err);
        res.status(500).json({ error: 'Dashboard data failed' });
    }
});

function timeAgo(date) {
    const diff = Math.floor((Date.now() - new Date(date)) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} min ago`;
    return `${Math.floor(diff / 60)} hr ago`;
}

function getSummary(result) {
    const f = result.feature;
    const o = result.output;
    if (f === 'cost-estimate') return `₹${o?.summary?.totalCost?.toLocaleString()} estimate`;
    if (f === 'contract-risk') return `Risk: ${o?.riskLevel} (score ${o?.riskScore})`;
    if (f === 'room-planner') return `${result.input?.rooms}BHK ${result.input?.style}`;
    if (f === 'timeline') return `${o?.summary?.totalMonths} timeline`;
    if (f === 'arch-recs') return o?.recommendations?.[0]?.style || 'Style recommended';
    if (f === 'material-price') return `${o?.materials?.length} materials tracked`;
    if (f === 'design-suggest') return `${result.input?.style || ''} ${result.input?.roomType || ''} Visualized`;
    return 'AI Analysis';
}

module.exports = router;
