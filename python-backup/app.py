from flask import Flask, render_template, request, jsonify
from bson import ObjectId
from db import get_db

app = Flask(__name__)

try:
    db = get_db()
    db.command('ping')
    print("MongoDB connected successfully!")
except Exception as e:
    db = None
    print(f"Warning: Could not connect to MongoDB. Error: {e}")

# ─────────────────────────────────────────────
# MOCK DATA
# ─────────────────────────────────────────────

INTERIOR_DESIGNS = [
    {"id": "modern", "name": "Modern Minimalist", "tag": "Most Popular", "description": "Clean lines, neutral palette, and smart storage. Perfect for urban apartments and new homes.", "image_url": "/static/images/interior_modern.png", "color_palette": ["#F5F5F0", "#D4C5B0", "#8B7355", "#2C2C2C"], "cost_per_sqft": {"budget": 800, "standard": 1400, "premium": 2500}, "key_materials": ["Engineered Wood", "Glass Partitions", "LED Panels", "Vinyl Flooring", "Acrylic Cabinets"], "typical_rooms": ["Living Room", "Bedroom", "Kitchen", "Bathroom"], "timeline_days": {"1BHK": 45, "2BHK": 65, "3BHK": 90}},
    {"id": "traditional", "name": "Traditional Indian", "tag": "Heritage Style", "description": "Rich carved woodwork, warm earth tones, and ornate detailing rooted in South Indian craftsmanship.", "image_url": "/static/images/interior_traditional.png", "color_palette": ["#8B4513", "#D2691E", "#DAA520", "#2F1B0E"], "cost_per_sqft": {"budget": 1000, "standard": 1800, "premium": 3200}, "key_materials": ["Teak Wood", "Brass Fixtures", "Terracotta Tiles", "Silk Drapes", "Handcrafted Jali"], "typical_rooms": ["Living Room", "Pooja Room", "Bedroom", "Dining"], "timeline_days": {"1BHK": 60, "2BHK": 85, "3BHK": 120}},
    {"id": "scandinavian", "name": "Scandinavian", "tag": "Cozy & Clean", "description": "Hygge-inspired warmth with light woods, natural textures, and a calm, uncluttered atmosphere.", "image_url": "/static/images/interior_scandinavian.png", "color_palette": ["#FAFAF8", "#E8DDD0", "#A0906C", "#4A4A4A"], "cost_per_sqft": {"budget": 700, "standard": 1200, "premium": 2000}, "key_materials": ["Oak Veneer", "Linen Upholstery", "Rattan Accents", "Ceramic Tiles", "Natural Stone"], "typical_rooms": ["Living Room", "Bedroom", "Home Office", "Kitchen"], "timeline_days": {"1BHK": 40, "2BHK": 55, "3BHK": 80}},
    {"id": "luxury", "name": "Ultra Luxury", "tag": "Premium", "description": "Bold statement pieces, imported marble, velvet finishes and dramatic lighting for a penthouse feel.", "image_url": "/static/images/interior_luxury.png", "color_palette": ["#1A1A2E", "#16213E", "#0F3460", "#E94560"], "cost_per_sqft": {"budget": 2000, "standard": 3500, "premium": 6000}, "key_materials": ["Italian Marble", "Crystal Chandeliers", "Velvet Upholstery", "Gold Fixtures", "Smart Automation"], "typical_rooms": ["Living Room", "Master Bedroom", "Home Theater", "Bar Lounge"], "timeline_days": {"1BHK": 75, "2BHK": 110, "3BHK": 150}}
]

FURNITURE_STORES = [
    {"name": "IKEA", "city": "Hyderabad", "address": "Survey No.1, Hitec City", "price_range": "Budget–Mid", "specialty": "Flat-pack modern furniture", "website": "https://www.ikea.com/in", "styles": ["Modern", "Scandinavian"], "rating": 4.4, "distance_km": 12},
    {"name": "HomeTown", "city": "Hyderabad", "address": "Inorbit Mall, Madhapur", "price_range": "Budget–Mid", "specialty": "Home furniture & decor", "website": "https://www.hometown.in", "styles": ["Modern", "Traditional"], "rating": 4.1, "distance_km": 8},
    {"name": "Pepperfry Studio", "city": "Hyderabad", "address": "Jubilee Hills, Rd No. 36", "price_range": "Mid–Premium", "specialty": "Online + experience store", "website": "https://www.pepperfry.com", "styles": ["Modern", "Scandinavian", "Luxury"], "rating": 4.3, "distance_km": 10},
    {"name": "Urban Ladder", "city": "Hyderabad", "address": "Banjara Hills, Rd No. 12", "price_range": "Mid–Premium", "specialty": "Curated modern furniture", "website": "https://www.urbanladder.com", "styles": ["Modern", "Scandinavian"], "rating": 4.5, "distance_km": 15},
    {"name": "Damro Furniture", "city": "Hyderabad", "address": "SR Nagar Main Rd", "price_range": "Budget", "specialty": "Affordable complete home packages", "website": "https://www.damro.in", "styles": ["Traditional", "Modern"], "rating": 4.0, "distance_km": 6},
    {"name": "Godrej Interio", "city": "Hyderabad", "address": "Ameerpet, Main Rd", "price_range": "Mid–Premium", "specialty": "Ergonomic and workspace furniture", "website": "https://www.godrejinterio.com", "styles": ["Modern", "Luxury"], "rating": 4.2, "distance_km": 9},
]

PROFESSIONALS = [
    {"name": "Srinivas Interior Designs", "city": "Hyderabad", "area": "Banjara Hills", "experience_yrs": 12, "specialties": ["Modern", "Scandinavian"], "rating": 4.8, "projects_done": 145, "price_per_sqft_from": 900, "phone": "+91 98765 43210"},
    {"name": "Heritage Craft Interiors", "city": "Hyderabad", "area": "Kukatpally", "experience_yrs": 18, "specialties": ["Traditional Indian", "Classic"], "rating": 4.7, "projects_done": 210, "price_per_sqft_from": 1100, "phone": "+91 91234 56789"},
    {"name": "Urban Canvas Studio", "city": "Hyderabad", "area": "Madhapur", "experience_yrs": 7, "specialties": ["Modern", "Luxury", "Contemporary"], "rating": 4.9, "projects_done": 89, "price_per_sqft_from": 1500, "phone": "+91 87654 32109"},
    {"name": "Nordic Spaces India", "city": "Hyderabad", "area": "Jubilee Hills", "experience_yrs": 5, "specialties": ["Scandinavian", "Minimalist"], "rating": 4.8, "projects_done": 54, "price_per_sqft_from": 1200, "phone": "+91 96543 21098"},
    {"name": "Luxe Living Solutions", "city": "Hyderabad", "area": "Gachibowli", "experience_yrs": 10, "specialties": ["Luxury", "Modern"], "rating": 4.9, "projects_done": 67, "price_per_sqft_from": 2200, "phone": "+91 94456 78901"},
]

MOCK_TEMPLATES = [
    {"name": "3BHK Modern Compact", "area": 1400, "style": "Modern", "bedrooms": 3, "description": "Space-efficient 3BHK with open kitchen and modular storage.", "image_url": "/assets/images/template1.png", "uploaded_by": "Ravi Sharma"},
    {"name": "2BHK Traditional", "area": 1000, "style": "Traditional", "bedrooms": 2, "description": "Warm wooden accents with a dedicated pooja room.", "image_url": "/assets/images/template2.png", "uploaded_by": "Priya Nair"},
    {"name": "4BHK Luxury Villa", "area": 3200, "style": "Luxury", "bedrooms": 4, "description": "Grand luxury layout with home theater and bar lounge.", "image_url": "/assets/images/template3.png", "uploaded_by": "Arjun Mehta"},
    {"name": "1BHK Scandinavian Studio", "area": 600, "style": "Scandinavian", "bedrooms": 1, "description": "Minimalist studio with smart space utilisation.", "image_url": "/assets/images/urban_house.png", "uploaded_by": "Sneha Reddy"},
]

MOCK_PROMOTIONS = [
    {
        "_id": "promo1",
        "title": "GK Luxury Villa & Penthouse",
        "description": "Exquisite 4BHK duplex villa featuring imported Italian marble, modular kitchen, a private rooftop swimming pool, landscaped gardens, and smart voice automation systems.",
        "propertyType": "Villa",
        "location": "Jubilee Hills, Hyderabad",
        "price": 45000000,
        "area": 4200,
        "imageUrl": "/assets/images/template3.png",
        "videoUrl": "",
        "ownerName": "GK Luxury Company",
        "ownerPhone": "7013241482",
        "likes": 128,
        "createdAt": "2026-05-28T00:00:00Z"
    },
    {
        "_id": "promo2",
        "title": "Prestige High-Rise Apartments",
        "description": "Spacious 3BHK premium apartment on the 24th floor offering panoramic city views. Multi-level car parking, clubhouse access, indoor gym, and round-the-clock power backup.",
        "propertyType": "Apartment",
        "location": "Gachibowli, Hyderabad",
        "price": 18500000,
        "area": 2200,
        "imageUrl": "/assets/images/high_rise.png",
        "videoUrl": "",
        "ownerName": "Elite Construction Builders",
        "ownerPhone": "9876543210",
        "likes": 84,
        "createdAt": "2026-05-28T00:00:00Z"
    }
]

MOCK_MATERIALS = [
    {"name": "Cement (50kg bag)", "unit": "bag", "price": 400, "trend": "down", "supplier": "Ultratech", "category": "Structure"},
    {"name": "TMT Steel", "unit": "ton", "price": 58000, "trend": "up", "supplier": "TATA Steel", "category": "Structure"},
    {"name": "River Sand", "unit": "CFT", "price": 65, "trend": "stable", "supplier": "Local Quarry", "category": "Structure"},
    {"name": "Red Bricks (1000 pcs)", "unit": "1000 pcs", "price": 7500, "trend": "stable", "supplier": "Local Kiln", "category": "Structure"},
    {"name": "AAC Blocks (m³)", "unit": "m³", "price": 4200, "trend": "down", "supplier": "Birla Aerocon", "category": "Structure"},
    {"name": "Vitrified Tiles (sqft)", "unit": "sqft", "price": 55, "trend": "up", "supplier": "Kajaria", "category": "Finishing"},
    {"name": "Interior Paint (4L)", "unit": "can", "price": 850, "trend": "stable", "supplier": "Asian Paints", "category": "Finishing"},
    {"name": "CPVC Pipe (3m)", "unit": "piece", "price": 280, "trend": "up", "supplier": "Astral Pipes", "category": "Plumbing"},
    {"name": "Electrical Wire (90m)", "unit": "roll", "price": 3200, "trend": "stable", "supplier": "Finolex", "category": "Electrical"},
    {"name": "Granite (sqft)", "unit": "sqft", "price": 120, "trend": "up", "supplier": "Rajasthan Marble", "category": "Finishing"},
    {"name": "Plywood (8x4 ft)", "unit": "sheet", "price": 1800, "trend": "down", "supplier": "Greenply", "category": "Carpentry"},
    {"name": "M-Sand (CFT)", "unit": "CFT", "price": 40, "trend": "stable", "supplier": "Local Supplier", "category": "Structure"},
]

MOCK_VENDORS = [
    {"name": "Ramesh Constructions", "owner": "Ramesh Kumar", "city": "Hyderabad", "area": "Kukatpally", "experience_yrs": 14, "specialties": ["Residential", "Commercial"], "rating": 4.7, "projects_done": 87, "min_project_size": 500000, "phone": "+91 98001 12345"},
    {"name": "Sri Venkatesh Builders", "owner": "Venkatesh Rao", "city": "Hyderabad", "area": "Miyapur", "experience_yrs": 9, "specialties": ["Residential", "Renovation"], "rating": 4.5, "projects_done": 52, "min_project_size": 300000, "phone": "+91 97002 23456"},
    {"name": "Deccan Civil Works", "owner": "Suresh Patil", "city": "Hyderabad", "area": "LB Nagar", "experience_yrs": 20, "specialties": ["Commercial", "Industrial"], "rating": 4.8, "projects_done": 210, "min_project_size": 2000000, "phone": "+91 96003 34567"},
    {"name": "Green Build Contractors", "owner": "Anita Sharma", "city": "Hyderabad", "area": "Gachibowli", "experience_yrs": 6, "specialties": ["Eco-Friendly", "Residential"], "rating": 4.9, "projects_done": 34, "min_project_size": 800000, "phone": "+91 95004 45678"},
    {"name": "Prime Structure Builders", "owner": "Mohammed Ali", "city": "Hyderabad", "area": "Secunderabad", "experience_yrs": 16, "specialties": ["Residential", "Luxury Villas"], "rating": 4.6, "projects_done": 120, "min_project_size": 1500000, "phone": "+91 94005 56789"},
]

MOCK_PROJECTS = [
    {"title": "Sharma Residence", "owner": "Mr. Sharma", "area": 1800, "type": "3BHK", "status": "In Progress", "progress": 45, "budget": 3600000, "start_date": "2026-01-15", "location": "Banjara Hills", "builder": "Ramesh Constructions"},
    {"title": "Verma Phase 2", "owner": "Mrs. Verma", "area": 2200, "type": "4BHK", "status": "Near Completion", "progress": 80, "budget": 5500000, "start_date": "2025-10-01", "location": "Jubilee Hills", "builder": "Deccan Civil Works"},
    {"title": "Rao Family Home", "owner": "Mr. Rao", "area": 1200, "type": "2BHK", "status": "Planning", "progress": 15, "budget": 2400000, "start_date": "2026-03-10", "location": "Madhapur", "builder": "Sri Venkatesh Builders"},
]

# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────

def serialize(doc):
    doc['_id'] = str(doc['_id'])
    return doc

# ─────────────────────────────────────────────
# PAGE ROUTES
# ─────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard/customer')
def customer_dashboard():
    return render_template('customer_dashboard.html')

@app.route('/dashboard/architect')
def architect_dashboard():
    return render_template('architect_dashboard.html')

@app.route('/dashboard/builder')
def builder_dashboard():
    return render_template('builder_dashboard.html')

@app.route('/dashboard/interior')
def interior_dashboard():
    return render_template('interior_dashboard.html')

# ─────────────────────────────────────────────
# SEED ALL DATA
# ─────────────────────────────────────────────

@app.route('/api/seed/all', methods=['POST'])
def seed_all():
    if db is None:
        return jsonify({'error': 'Database not connected'}), 503
    db.interior_designs.drop(); db.interior_professionals.drop(); db.furniture_stores.drop()
    db.templates.drop(); db.materials.drop(); db.vendors.drop(); db.projects.drop()
    db.interior_designs.insert_many(INTERIOR_DESIGNS)
    db.interior_professionals.insert_many(PROFESSIONALS)
    db.furniture_stores.insert_many(FURNITURE_STORES)
    db.templates.insert_many(MOCK_TEMPLATES)
    db.materials.insert_many(MOCK_MATERIALS)
    db.vendors.insert_many(MOCK_VENDORS)
    db.projects.insert_many(MOCK_PROJECTS)
    return jsonify({'message': 'All data seeded successfully to MongoDB!'})

# ─────────────────────────────────────────────
# CONSTRUCTION ESTIMATE (shared)
# ─────────────────────────────────────────────

@app.route('/api/estimate', methods=['POST'])
def estimate_cost():
    data = request.json
    area = float(data.get('area', 0))
    quality = data.get('quality', 'standard')
    margin_pct = float(data.get('margin', 0))
    rates = {'budget': 1500, 'standard': 2000, 'premium': 3000}
    rate = rates.get(quality, 2000)
    base_cost = area * rate
    margin = base_cost * (margin_pct / 100)
    total_cost = base_cost + margin
    return jsonify({
        'total': round(total_cost),
        'base_cost': round(base_cost),
        'margin': round(margin),
        'breakdown': {
            'foundation': round(base_cost * 0.15),
            'structure': round(base_cost * 0.30),
            'materials': round(base_cost * 0.25),
            'labor': round(base_cost * 0.20),
            'finishing': round(base_cost * 0.07),
            'misc': round(base_cost * 0.03)
        }
    })

# ─────────────────────────────────────────────
# TEMPLATES (shared between customer + architect)
# ─────────────────────────────────────────────

@app.route('/api/templates', methods=['GET'])
def get_templates():
    style = request.args.get('style', '')
    if db is not None:
        q = {}
        if style: q['style'] = style
        docs = list(db.templates.find(q))
        if docs:
            return jsonify([serialize(d) for d in docs])
    result = MOCK_TEMPLATES
    if style:
        result = [t for t in result if t['style'].lower() == style.lower()]
    return jsonify(result)

@app.route('/api/templates', methods=['POST'])
def add_template():
    data = request.json
    required = ['name', 'area', 'style', 'image_url']
    if not all(data.get(k) is not None for k in required):
        return jsonify({'error': 'Missing required fields'}), 400
    doc = {
        'name': data['name'],
        'area': float(data['area']),
        'style': data['style'],
        'image_url': data['image_url']
    }
    if db is not None:
        result = db.templates.insert_one(doc)
        doc['_id'] = str(result.inserted_id)
        return jsonify(doc), 201
    import random
    doc['_id'] = f"mock_{random.randint(1000, 9999)}"
    return jsonify(doc), 201

@app.route('/api/templates/<template_id>', methods=['DELETE'])
def delete_template(template_id):
    if db is not None:
        try:
            db.templates.delete_one({'_id': ObjectId(template_id)})
            return jsonify({'message': 'Template deleted', 'id': template_id})
        except Exception:
            return jsonify({'error': 'Invalid ID'}), 400
    return jsonify({'message': 'Template deleted (mock)', 'id': template_id})

@app.route('/api/architect/quote', methods=['POST'])
def generate_quote():
    data = request.json
    area = float(data.get('area', 0))
    style = data.get('style', 'Modern')
    client = data.get('client_name', 'Client')
    rates = {'Modern': 2000, 'Traditional': 2200, 'Luxury': 3500, 'Scandinavian': 1800, 'Standard': 2000}
    rate = rates.get(style, 2000)
    total = area * rate
    return jsonify({
        'client': client, 'style': style, 'area': area, 'rate_per_sqft': rate,
        'total_estimate': round(total),
        'breakdown': {
            'design_fee': round(total * 0.05),
            'structure': round(total * 0.30),
            'materials': round(total * 0.25),
            'labor': round(total * 0.20),
            'finishing': round(total * 0.15),
            'misc': round(total * 0.05)
        },
        'validity_days': 30
    })

# ─────────────────────────────────────────────
# PROJECTS
# ─────────────────────────────────────────────

@app.route('/api/projects', methods=['GET'])
def get_projects():
    if db is not None:
        docs = list(db.projects.find())
        return jsonify([serialize(d) for d in docs])
    return jsonify(MOCK_PROJECTS)

@app.route('/api/projects', methods=['POST'])
def save_project():
    data = request.json
    doc = {
        'title': data.get('title', 'Untitled Project'),
        'owner': data.get('owner', 'House Owner'),
        'area': float(data.get('area', 0)),
        'type': data.get('type', '2BHK'),
        'status': 'Planning',
        'progress': 0,
        'budget': float(data.get('budget', 0)),
        'location': data.get('location', 'Hyderabad'),
        'builder': data.get('builder', 'TBD'),
        'start_date': data.get('start_date', '2026-01-01')
    }
    if db is not None:
        result = db.projects.insert_one(doc)
        doc['_id'] = str(result.inserted_id)
        return jsonify({'message': 'Project saved!', 'project': doc}), 201
    return jsonify({'message': 'Project saved (mock)', 'project': doc}), 201

# ─────────────────────────────────────────────
# MATERIALS
# ─────────────────────────────────────────────

@app.route('/api/builder/materials', methods=['GET'])
def get_materials():
    category = request.args.get('category', '')
    if db is not None:
        q = {}
        if category: q['category'] = category
        docs = list(db.materials.find(q))
        if docs:
            return jsonify([serialize(d) for d in docs])
    result = MOCK_MATERIALS
    if category:
        result = [m for m in result if m['category'].lower() == category.lower()]
    return jsonify(result)

# ─────────────────────────────────────────────
# VENDORS
# ─────────────────────────────────────────────

@app.route('/api/vendor/list', methods=['GET'])
def get_vendors():
    specialty = request.args.get('specialty', '')
    if db is not None:
        q = {}
        if specialty: q['specialties'] = {'$in': [specialty]}
        docs = list(db.vendors.find(q))
        if docs:
            return jsonify([serialize(d) for d in docs])
    result = MOCK_VENDORS
    if specialty:
        result = [v for v in result if any(specialty.lower() in s.lower() for s in v['specialties'])]
    return jsonify(result if result else MOCK_VENDORS)

@app.route('/api/vendor/register', methods=['POST'])
def register_vendor():
    data = request.json
    required = ['name', 'owner', 'city', 'area', 'experience_yrs', 'phone']
    if not all(data.get(k) for k in required):
        return jsonify({'error': 'Please fill all required fields'}), 400
    doc = {
        'name': data['name'], 'owner': data['owner'], 'city': data['city'],
        'area': data['area'], 'experience_yrs': int(data['experience_yrs']),
        'specialties': data.get('specialties', ['Residential']),
        'phone': data['phone'], 'min_project_size': int(data.get('min_project_size', 500000)),
        'rating': 0, 'projects_done': 0
    }
    if db is not None:
        result = db.vendors.insert_one(doc)
        doc['_id'] = str(result.inserted_id)
        return jsonify({'message': 'Vendor registered successfully!', 'vendor': doc}), 201
    return jsonify({'message': 'Registered (mock — DB not connected)', 'vendor': doc}), 201

# ─────────────────────────────────────────────
# CUSTOMER BUILDERS SEARCH
# ─────────────────────────────────────────────

@app.route('/api/customer/builders', methods=['GET'])
def get_builders_for_customer():
    budget = request.args.get('budget', '')
    if db is not None:
        docs = list(db.vendors.find())
        vendors = [serialize(d) for d in docs] if docs else MOCK_VENDORS
    else:
        vendors = MOCK_VENDORS
    if budget == 'budget':
        vendors = [v for v in vendors if v.get('min_project_size', 0) <= 800000]
    elif budget == 'premium':
        vendors = [v for v in vendors if v.get('min_project_size', 0) >= 1000000]
    return jsonify(vendors)

# ─────────────────────────────────────────────
# INTERIOR DESIGN APIs
# ─────────────────────────────────────────────

@app.route('/api/interior/designs', methods=['GET'])
def get_interior_designs():
    if db is not None:
        saved = list(db.interior_designs.find({}, {'_id': 0}))
        if saved: return jsonify(saved)
    return jsonify(INTERIOR_DESIGNS)

@app.route('/api/interior/estimate', methods=['POST'])
def interior_estimate():
    data = request.json
    design_id = data.get('design_id', 'modern')
    area = float(data.get('area', 0))
    budget_level = data.get('budget_level', 'standard')
    rooms = data.get('rooms', [])
    design = next((d for d in INTERIOR_DESIGNS if d['id'] == design_id), INTERIOR_DESIGNS[0])
    rate = design['cost_per_sqft'].get(budget_level, design['cost_per_sqft']['standard'])
    total = area * rate
    room_weights = {'Living Room': 0.30, 'Master Bedroom': 0.22, 'Bedroom': 0.18, 'Kitchen': 0.20, 'Bathroom': 0.08, 'Dining': 0.10, 'Pooja Room': 0.05, 'Home Office': 0.15, 'Home Theater': 0.25}
    room_costs = [{"room": r, "cost": round(total * room_weights.get(r, 0.15))} for r in rooms]
    timeline = design['timeline_days'].get(data.get('bhk', '2BHK'), 65)
    return jsonify({'design_name': design['name'], 'total_cost': round(total), 'cost_per_sqft': rate, 'breakdown': {'furniture': round(total * 0.40), 'labor': round(total * 0.25), 'materials': round(total * 0.20), 'electrical_lighting': round(total * 0.10), 'miscellaneous': round(total * 0.05)}, 'room_wise': room_costs, 'key_materials': design['key_materials'], 'estimated_days': timeline})

@app.route('/api/interior/professionals', methods=['GET'])
def get_professionals():
    style = request.args.get('style', '')
    if db is not None:
        q = {'specialties': {'$in': [style]}} if style else {}
        saved = list(db.interior_professionals.find(q, {'_id': 0}))
        if saved: return jsonify(saved)
    result = PROFESSIONALS
    if style:
        result = [p for p in PROFESSIONALS if any(style.lower() in s.lower() for s in p['specialties'])]
    return jsonify(result if result else PROFESSIONALS)

@app.route('/api/interior/stores', methods=['GET'])
def get_stores():
    style = request.args.get('style', '')
    budget = request.args.get('budget', '')
    if db is not None:
        saved = list(db.furniture_stores.find({}, {'_id': 0}))
        if saved:
            result = saved
            if style: result = [s for s in result if any(style.lower() in st.lower() for st in s['styles'])]
            if budget == 'budget': result = [s for s in result if 'Budget' in s.get('price_range', '')]
            return jsonify(result)
    result = FURNITURE_STORES
    if style: result = [s for s in result if any(style.lower() in st.lower() for st in s['styles'])]
    if budget == 'budget': result = [s for s in result if 'Budget' in s['price_range']]
    return jsonify(result if result else FURNITURE_STORES)

# ─────────────────────────────────────────────
# PORTFOLIO CRUD (Role-specific)
# ─────────────────────────────────────────────

@app.route('/api/portfolio', methods=['GET'])
def get_portfolio():
    role = request.args.get('role', '')
    category = request.args.get('category', '')
    
    if db is not None:
        q = {}
        if role: q['role'] = role
        if category: q['category'] = category
        docs = list(db.portfolio_items.find(q).sort('createdAt', -1))
        return jsonify([serialize(d) for d in docs])
        
    # Return mock data if DB not connected
    mocks = [
        {
            "_id": "mock1",
            "title": "Modern 3BHK Eco-Villa Design",
            "description": "A beautiful architectural floor plan and 3D rendering featuring sustainable solar panels, cross-ventilation, and smart home control systems.",
            "role": "architect",
            "category": "design",
            "imageUrl": "/assets/images/template1.png",
            "author": "Ar. Raghav Rao",
            "createdAt": "2026-05-28T00:00:00Z"
        },
        {
            "_id": "mock2",
            "title": "Skyline Premium Towers",
            "description": "Ongoing high-rise structure featuring advanced structural steel frames and earthquake-resistant designs. Floor 12 currently in casting phase.",
            "role": "builder",
            "category": "construction",
            "imageUrl": "/assets/images/high_rise.png",
            "author": "Elite Construction Builders",
            "createdAt": "2026-05-28T00:00:00Z"
        },
        {
            "_id": "mock3",
            "title": "Scandinavian Minimalist Living Room",
            "description": "A cozy living space designed using neutral palettes, light oak flooring, natural textures, and micro-led ambient lighting.",
            "role": "interior",
            "category": "interior_design",
            "imageUrl": "/assets/images/luxury_villa.png",
            "author": "Heritage Craft Interiors",
            "createdAt": "2026-05-28T00:00:00Z"
        },
        {
            "_id": "mock4",
            "title": "My Dream Kitchen Inspiration",
            "description": "Saved layout with dual kitchen island, brass fittings, and navy blue shaker cabinets.",
            "role": "customer",
            "category": "idea",
            "imageUrl": "/assets/images/urban_house.png",
            "author": "House Owner",
            "createdAt": "2026-05-28T00:00:00Z"
        }
    ]
    if role:
        mocks = [m for m in mocks if m['role'] == role]
    if category:
        mocks = [m for m in mocks if m['category'] == category]
    return jsonify(mocks)

@app.route('/api/portfolio', methods=['POST'])
def create_portfolio_item():
    data = request.json
    required = ['title', 'description', 'role', 'category', 'imageUrl']
    if not all(data.get(k) for k in required):
        return jsonify({'error': 'Missing required fields'}), 400
        
    doc = {k: data[k] for k in required}
    doc['author'] = data.get('author', 'Anonymous')
    
    import datetime
    doc['createdAt'] = datetime.datetime.utcnow().isoformat()
    
    if db is not None:
        result = db.portfolio_items.insert_one(doc)
        doc['_id'] = str(result.inserted_id)
        return jsonify(doc), 201
        
    import random
    doc['_id'] = f"mock_{random.randint(1000, 9999)}"
    return jsonify(doc), 201

@app.route('/api/portfolio/<item_id>', methods=['PUT'])
def update_portfolio_item(item_id):
    data = request.json
    if db is not None:
        try:
            update_data = {}
            for k in ['title', 'description', 'role', 'category', 'imageUrl', 'author']:
                if k in data:
                    update_data[k] = data[k]
            
            db.portfolio_items.update_one({'_id': ObjectId(item_id)}, {'$set': update_data})
            updated_doc = db.portfolio_items.find_one({'_id': ObjectId(item_id)})
            return jsonify(serialize(updated_doc))
        except Exception as e:
            return jsonify({'error': str(e)}), 400
            
    # Mock update response
    return jsonify(data)

@app.route('/api/portfolio/<item_id>', methods=['DELETE'])
def delete_portfolio_item(item_id):
    if db is not None:
        try:
            db.portfolio_items.delete_one({'_id': ObjectId(item_id)})
            return jsonify({'message': 'Portfolio item deleted', 'id': item_id})
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    return jsonify({'message': 'Portfolio item deleted (mock)', 'id': item_id})

# ─────────────────────────────────────────────
# PROMOTIONS CRUD
# ─────────────────────────────────────────────

@app.route('/api/promotions', methods=['GET'])
def get_promotions():
    if db is not None:
        docs = list(db.promotions.find().sort('createdAt', -1))
        if docs:
            return jsonify([serialize(d) for d in docs])
    return jsonify(MOCK_PROMOTIONS)

@app.route('/api/promotions', methods=['POST'])
def create_promotion():
    data = request.json
    required = ['title', 'description', 'propertyType', 'location', 'price', 'area', 'ownerName', 'ownerPhone']
    if not all(data.get(k) is not None for k in required):
        return jsonify({'error': 'Missing required fields'}), 400
        
    doc = {k: data[k] for k in required}
    doc['imageUrl'] = data.get('imageUrl', '')
    doc['videoUrl'] = data.get('videoUrl', '')
    doc['likes'] = 0
    
    import datetime
    doc['createdAt'] = datetime.datetime.utcnow().isoformat()
    
    if db is not None:
        result = db.promotions.insert_one(doc)
        doc['_id'] = str(result.inserted_id)
        return jsonify(doc), 201
    
    import random
    doc['_id'] = f"mock_{random.randint(1000, 9999)}"
    return jsonify(doc), 201

@app.route('/api/promotions/<promo_id>', methods=['PUT'])
def update_promotion(promo_id):
    data = request.json
    if db is not None:
        try:
            update_data = {}
            for k in ['title', 'description', 'propertyType', 'location', 'price', 'area', 'imageUrl', 'videoUrl', 'ownerName', 'ownerPhone']:
                if k in data:
                    update_data[k] = data[k]
            
            db.promotions.update_one({'_id': ObjectId(promo_id)}, {'$set': update_data})
            updated_doc = db.promotions.find_one({'_id': ObjectId(promo_id)})
            return jsonify(serialize(updated_doc))
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    return jsonify(data)

@app.route('/api/promotions/<promo_id>', methods=['DELETE'])
def delete_promotion(promo_id):
    if db is not None:
        try:
            db.promotions.delete_one({'_id': ObjectId(promo_id)})
            return jsonify({'message': 'Promotion deleted', 'id': promo_id})
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    return jsonify({'message': 'Promotion deleted (mock)', 'id': promo_id})

@app.route('/api/promotions/<promo_id>/like', methods=['POST'])
def like_promotion(promo_id):
    if db is not None:
        try:
            db.promotions.update_one({'_id': ObjectId(promo_id)}, {'$inc': {'likes': 1}})
            updated_doc = db.promotions.find_one({'_id': ObjectId(promo_id)})
            return jsonify(serialize(updated_doc))
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    return jsonify({'message': 'Liked (mock)', 'id': promo_id})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
