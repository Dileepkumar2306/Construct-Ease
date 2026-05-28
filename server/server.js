const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({
    origin:      ['http://localhost:4200', 'http://localhost:5000'],
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - body keys: ${Object.keys(req.body || {})}`);
    next();
});

const interiorRoutes = require('./routes/interior');
const companyRoutes  = require('./routes/company');
const aiRoutes       = require('./routes/ai');
const portfolioRoutes = require('./routes/portfolio');
const promotionsRoutes = require('./routes/promotions');

app.use('/api', apiRoutes);
app.use('/api/interior', interiorRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/promotions', promotionsRoutes);

const path = require('path');

app.use(express.static(path.join(__dirname, '../client/dist/client/browser')));

app.get('/api-status', (req, res) => {
    res.send('API is running...');
});

app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    res.sendFile(path.join(__dirname, '../client/dist/client/browser/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
