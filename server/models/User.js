const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema for Construct Ease
 * Supports both email and phone-based authentication (either one is required).
 * Passwords are stored as bcrypt hashes; OTP-only users may have null passwordHash.
 */
const UserSchema = new mongoose.Schema({
    name:         { type: String, required: true, trim: true },
    email:        { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone:        { type: String, unique: true, sparse: true, trim: true },
    passwordHash: { type: String, default: null },
    role: {
        type:    String,
        enum:    ['customer', 'architect', 'builder', 'interior', 'admin'],
        default: 'customer'
    },
    isVerified: { type: Boolean, default: false },
    createdAt:  { type: Date,    default: Date.now },
    lastLogin:  { type: Date,    default: null }
});

/**
 * Compares a plain-text password against the stored bcrypt hash.
 * Returns false if no password is set (OTP-only account).
 */
UserSchema.methods.comparePassword = async function (password) {
    if (!this.passwordHash) return false;
    return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);
