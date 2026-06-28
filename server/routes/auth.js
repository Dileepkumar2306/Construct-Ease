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

        if (user) {
            if (!user.passwordHash) {
                // If user exists without password, update password hash with current password
                const salt = await bcrypt.genSalt(10);
                user.passwordHash = await bcrypt.hash(password, salt);
            } else {
                // Compare password
                const isMatch = await user.comparePassword(password);
                if (!isMatch) {
                    return res.status(401).json({ message: 'Invalid password. If this is an existing account, please verify your password.' });
                }
            }
            // Upgrade role to owner for owner login tab
            user.role = 'owner';
        } else {
            // Auto-create owner account if first time logging in
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            user = new User({
                name: name || 'Company Owner',
                phone: cleanPhone,
                passwordHash,
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

        if (user) {
            if (!user.passwordHash) {
                // If user exists without password, update password hash with current password
                const salt = await bcrypt.genSalt(10);
                user.passwordHash = await bcrypt.hash(password, salt);
            } else {
                // Compare password
                const isMatch = await user.comparePassword(password);
                if (!isMatch) {
                    return res.status(401).json({ message: 'Invalid password for this account.' });
                }
            }
        } else {
            // Auto-create customer account if first time logging in
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            user = new User({
                name: name || cleanEmail.split('@')[0],
                email: cleanEmail,
                passwordHash,
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
