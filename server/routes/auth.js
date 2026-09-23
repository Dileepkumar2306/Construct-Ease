const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'construct_ease_secret_key_2026';

// In-memory user cache to ensure reliable operations if MongoDB is disconnected / in serverless fallback
const memoryUsers = new Map();

// Helper to generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id || user.id, role: user.role, email: user.email, phone: user.phone },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// Helper to sanitize phone numbers
const sanitizePhone = (phone) => {
    if (!phone) return '';
    return phone.toString().replace(/[^0-9]/g, '').slice(-10);
};

/**
 * @route   POST /api/auth/customer-register
 * @desc    Register a new customer with Name, Mobile Number, Email ID, and Password
 *          Does NOT auto-login, returning success so user transitions to login page.
 */
router.post('/customer-register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Full name is required.' });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ message: 'Email address is required.' });
        }
        if (!phone || !phone.toString().trim()) {
            return res.status(400).json({ message: 'Mobile number is required.' });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }

        const cleanName = name.trim();
        const cleanEmail = email.toLowerCase().trim();
        const cleanPhone = sanitizePhone(phone);

        if (cleanPhone.length < 10) {
            return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number.' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({ message: 'Please enter a valid email address.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Check if database is connected
        const isDbConnected = mongoose.connection.readyState === 1;

        if (isDbConnected) {
            // Check if user with this email or phone already exists
            const existingUser = await User.findOne({
                $or: [{ email: cleanEmail }, { phone: cleanPhone }]
            });

            if (existingUser) {
                if (existingUser.email === cleanEmail) {
                    return res.status(400).json({ message: 'An account with this email already exists. Please log in.' });
                } else {
                    return res.status(400).json({ message: 'An account with this mobile number already exists. Please log in.' });
                }
            }

            const newUser = new User({
                name: cleanName,
                email: cleanEmail,
                phone: cleanPhone,
                passwordHash,
                role: 'customer',
                isVerified: true,
                createdAt: new Date()
            });

            await newUser.save();

            // Cache in memory as well
            memoryUsers.set(cleanEmail, {
                _id: newUser._id.toString(),
                name: cleanName,
                email: cleanEmail,
                phone: cleanPhone,
                passwordHash,
                role: 'customer'
            });
            memoryUsers.set(cleanPhone, memoryUsers.get(cleanEmail));

            return res.status(201).json({
                success: true,
                message: 'Registration successful! Please log in with your email/mobile and password.',
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    phone: newUser.phone
                }
            });
        } else {
            // In-memory fallback
            if (memoryUsers.has(cleanEmail) || memoryUsers.has(cleanPhone)) {
                return res.status(400).json({ message: 'An account with this email or mobile number already exists. Please log in.' });
            }

            const memId = 'mem_' + Date.now();
            const memUser = {
                _id: memId,
                id: memId,
                name: cleanName,
                email: cleanEmail,
                phone: cleanPhone,
                passwordHash,
                role: 'customer',
                isVerified: true,
                createdAt: new Date()
            };

            memoryUsers.set(cleanEmail, memUser);
            memoryUsers.set(cleanPhone, memUser);

            return res.status(201).json({
                success: true,
                message: 'Registration successful! Please log in with your email/mobile and password.',
                user: {
                    id: memId,
                    name: cleanName,
                    email: cleanEmail,
                    phone: cleanPhone
                }
            });
        }
    } catch (err) {
        console.error('Customer Register Error:', err);
        res.status(500).json({ message: err.message || 'Server error during customer registration.' });
    }
});

/**
 * @route   POST /api/auth/customer-login
 * @desc    Login customer using Email or Mobile Number + Password
 */
router.post('/customer-login', async (req, res) => {
    try {
        const { identifier, email, phone, password } = req.body;
        const rawInput = (identifier || email || phone || '').toString().trim();

        if (!rawInput) {
            return res.status(400).json({ message: 'Email address or Mobile number is required.' });
        }
        if (!password) {
            return res.status(400).json({ message: 'Password is required.' });
        }

        const isEmailInput = rawInput.includes('@');
        const cleanEmail = isEmailInput ? rawInput.toLowerCase() : null;
        const cleanPhone = !isEmailInput ? sanitizePhone(rawInput) : null;

        const isDbConnected = mongoose.connection.readyState === 1;
        let user = null;

        if (isDbConnected) {
            if (cleanEmail) {
                user = await User.findOne({ email: cleanEmail });
            } else if (cleanPhone) {
                user = await User.findOne({ phone: cleanPhone });
            }
        }

        // Fallback to memory store if not found or DB disconnected
        if (!user) {
            if (cleanEmail && memoryUsers.has(cleanEmail)) {
                user = memoryUsers.get(cleanEmail);
            } else if (cleanPhone && memoryUsers.has(cleanPhone)) {
                user = memoryUsers.get(cleanPhone);
            }
        }

        if (!user) {
            return res.status(404).json({
                message: 'No account found with this email or mobile number. Please register first.'
            });
        }

        // Validate password
        let isMatch = false;
        if (user.passwordHash) {
            isMatch = await bcrypt.compare(password, user.passwordHash);
        }

        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password. Please try again.' });
        }

        // Update last login if DB connected
        if (isDbConnected && typeof user.save === 'function') {
            user.lastLogin = new Date();
            await user.save();
        }

        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user._id || user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role || 'customer'
            }
        });
    } catch (err) {
        console.error('Customer Login Error:', err);
        res.status(500).json({ message: err.message || 'Server error during customer login.' });
    }
});

/**
 * @route   POST /api/auth/google-login
 * @desc    Direct Google Authentication (Login or Register)
 */
router.post('/google-login', async (req, res) => {
    try {
        const { email, name, googleId, picture } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Google account email is required.' });
        }

        const cleanEmail = email.toLowerCase().trim();
        const isDbConnected = mongoose.connection.readyState === 1;
        let user = null;

        if (isDbConnected) {
            user = await User.findOne({ email: cleanEmail });

            if (user) {
                if (googleId && !user.googleId) user.googleId = googleId;
                if (picture && !user.avatar) user.avatar = picture;
                user.lastLogin = new Date();
                await user.save();
            } else {
                user = new User({
                    name: name || cleanEmail.split('@')[0],
                    email: cleanEmail,
                    googleId: googleId || 'google_' + Date.now(),
                    avatar: picture || '',
                    role: 'customer',
                    isVerified: true,
                    createdAt: new Date(),
                    lastLogin: new Date()
                });
                await user.save();
            }
        } else {
            // Memory store fallback
            if (memoryUsers.has(cleanEmail)) {
                user = memoryUsers.get(cleanEmail);
            } else {
                const memId = 'google_' + Date.now();
                user = {
                    _id: memId,
                    id: memId,
                    name: name || cleanEmail.split('@')[0],
                    email: cleanEmail,
                    googleId: googleId || memId,
                    avatar: picture || '',
                    role: 'customer',
                    isVerified: true
                };
                memoryUsers.set(cleanEmail, user);
            }
        }

        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user._id || user.id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                role: user.role || 'customer',
                avatar: user.avatar || ''
            }
        });
    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(500).json({ message: err.message || 'Server error during Google authentication.' });
    }
});

/**
 * @route   POST /api/auth/owner-login
 * @desc    Login or Register Company Owner using Mobile Number & Password
 */
router.post('/owner-login', async (req, res) => {
    try {
        const { phone, password, name } = req.body;
        if (!phone || !password) {
            return res.status(400).json({ message: 'Mobile number and password are required.' });
        }

        const cleanPhone = sanitizePhone(phone);
        if (cleanPhone.length < 10) {
            return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number.' });
        }

        const isDbConnected = mongoose.connection.readyState === 1;
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(password, salt);

        let user = null;

        if (isDbConnected) {
            user = await User.findOne({ phone: cleanPhone });

            if (user) {
                user.passwordHash = newPasswordHash;
                user.role = 'owner';
                if (name) user.name = name;
            } else {
                user = new User({
                    name: name || 'Company Owner',
                    phone: cleanPhone,
                    passwordHash: newPasswordHash,
                    role: 'owner',
                    isVerified: true
                });
            }

            user.lastLogin = new Date();
            await user.save();
        } else {
            const memId = 'owner_' + cleanPhone;
            user = {
                _id: memId,
                id: memId,
                name: name || 'Company Owner',
                phone: cleanPhone,
                role: 'owner',
                isVerified: true
            };
            memoryUsers.set(cleanPhone, user);
        }

        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user._id || user.id,
                name: user.name,
                phone: user.phone,
                role: user.role || 'owner'
            }
        });
    } catch (err) {
        console.error('Owner Login Error:', err);
        res.status(500).json({ message: 'Server error during owner authentication.' });
    }
});

module.exports = router;
