// Load environment variables first
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure local uploads directory exists
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

connectDB();



app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        
        // Dynamically allow any local origins (localhost, 127.0.0.1, or local IP networks)
        const isLocal = origin.includes('localhost') || 
                        origin.includes('127.0.0.1') || 
                        /https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin);
                        
        const isAllowed = isLocal || 
                          origin.includes('vercel.app') || 
                          origin.startsWith('chrome-extension://') || 
                          origin.startsWith('capacitor://');
                          
        if (isAllowed) {
            callback(null, true);
        } else {
            callback(null, false); // Standard CORS rejection (does not throw server 500)
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - body keys: ${Object.keys(req.body || {})}`);
    next();
});

const interiorRoutes   = require('./routes/interior');
const companyRoutes    = require('./routes/company');
const aiRoutes         = require('./routes/ai');
const portfolioRoutes  = require('./routes/portfolio');
const promotionsRoutes = require('./routes/promotions');
const authRoutes       = require('./routes/auth');
const uploadRoutes     = require('./routes/upload');

app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/interior', interiorRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/promotions', promotionsRoutes);
app.use('/api/upload', uploadRoutes);


app.use(express.static(path.join(__dirname, '../client/dist/client/browser')));

app.get('/api/api-status', (req, res) => {
    res.send('API is running...');
});

app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    res.sendFile(path.join(__dirname, '../client/dist/client/browser/index.html'));
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
