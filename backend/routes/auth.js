const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// In-memory 2FA store (email -> { code, expiresAt })
const pendingOtps = {};

// Helper to generate a 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1) Check all fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    // 2) Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // 3) Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4) Create and save user
    const newUser = new User({
      name,
      email,
      passwordHash,
    });

    await newUser.save();

    // 5) Send success response (no password included)
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// POST /api/auth/login
// Step 1 of login: check password and issue 2FA code
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Check fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password.' });
    }

    // 2) Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't say "no such email" for security reasons
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // 3) Compare password with hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // 4) Password is correct -> generate 2FA code
    const code = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    pendingOtps[email] = { code, expiresAt };

    // Log for demo / debugging (this is your "simulated SMS/email")
    console.log(`2FA code for ${email}: ${code}`);

    // 5) Tell frontend that 2FA is required
    return res.status(200).json({
      message: 'Password correct. 2FA code required.',
      twoFactorRequired: true,
      email,
      // For class demo, we also send the code back so you can see it.
      // In a real system you WOULD NOT send this in the response.
      otpPreview: code
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// POST /api/auth/verify-2fa
// Step 2 of login: verify 2FA code
router.post('/verify-2fa', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required.' });
    }

    const entry = pendingOtps[email];
    if (!entry) {
      return res.status(400).json({ message: 'No pending 2FA code for this email. Please log in again.' });
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      delete pendingOtps[email];
      return res.status(400).json({ message: '2FA code has expired. Please log in again.' });
    }

    // Check code
    if (code !== entry.code) {
      return res.status(400).json({ message: 'Invalid 2FA code.' });
    }

    // Code is valid -> clear pending code
    delete pendingOtps[email];

    // In a real app we would create a session or JWT here.
    // For this project, just say login is fully complete.
    return res.status(200).json({
      message: '2FA verification successful. Login complete.',
      email
    });
  } catch (err) {
    console.error('2FA verify error:', err.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;
