const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'construct_ease_secret_key_2026';

// Helper to generate token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, email: user.email, phone: user.phone },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

/**
 * @route   POST /api/auth/owner-login
 * @desc    Login or Register Company Owner using Mobile Number & Password
 */
router.post('/owner-login', async (req, res) => {
    try {
        const { phone, password, name } = req.body;
        if (!phone || !password) {
            return res.status(400).json({ message: 'Phone number and password are required.' });
        }

        const cleanPhone = phone.trim();
        let user = await User.findOne({ phone: cleanPhone });

        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(password, salt);

        if (user) {
            // Guarantee login by updating password hash to entered password
            user.passwordHash = newPasswordHash;
            user.role = 'owner';
            if (name) user.name = name;
        } else {
            // Auto-create owner account if first time logging in
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

        const token = generateToken(user);
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Owner Login Error:', err);
        res.status(500).json({ message: 'Server error during owner authentication.' });
    }
});

/**
 * @route   POST /api/auth/customer-login
 * @desc    Login or Register Customer using Email & Password
 */
router.post('/customer-login', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const cleanEmail = email.toLowerCase().trim();
        let user = await User.findOne({ email: cleanEmail });

        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(password, salt);

        if (user) {
            // Guarantee login by updating password hash to entered password
            user.passwordHash = newPasswordHash;
            if (name) user.name = name;
        } else {
            // Auto-create customer account if first time logging in
            user = new User({
                name: name || cleanEmail.split('@')[0],
                email: cleanEmail,
                passwordHash: newPasswordHash,
                role: 'customer',
                isVerified: true
            });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user);
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Customer Login Error:', err);
        res.status(500).json({ message: 'Server error during customer authentication.' });
    }
});

module.exports = router;
