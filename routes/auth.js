const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../config/models/User");

const router = express.Router();

function normalizePhone(phone) {
    const digits = String(phone || "").replace(/\D/g, "");
    // Accept +91XXXXXXXXXX or 91XXXXXXXXXX and normalize to 10 digits.
    if (digits.length === 12 && digits.startsWith("91")) {
        return digits.slice(2);
    }
    return digits;
}

// Validate password strength
function validatePasswordStrength(password) {
    const hasMinLength = password.length >= 6;
    const hasSpecialChar = /[!@#$%^&*\-_=+]/.test(password);
    return { isStrong: hasMinLength && hasSpecialChar, hasMinLength, hasSpecialChar };
}

// Register User
router.post("/register", async (req, res) => {
    const { name, email, password, phone } = req.body;
    try {
        // Basic validation
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ error: "Name, email, password and phone are required" });
        }

        // Validate password strength
        const pwdCheck = validatePasswordStrength(password);
        if (!pwdCheck.isStrong) {
            let errorMsg = 'This is a weak password. ';
            if (!pwdCheck.hasMinLength) errorMsg += 'Password must be at least 6 characters. ';
            if (!pwdCheck.hasSpecialChar) errorMsg += 'Password must contain a special character (!@#$%^&*-_=+). ';
            return res.status(400).json({ error: errorMsg });
        }

        const normalizedPhone = normalizePhone(phone);
        if (normalizedPhone.length !== 10) {
            return res.status(400).json({ error: "Valid 10-digit phone number is required" });
        }

        // Check duplicate
        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return res.status(409).json({ error: "User already exists" });
        }

        const existingPhone = await User.findOne({ phone: normalizedPhone });
        if (existingPhone) {
            return res.status(409).json({ error: "Phone number already registered" });
        }

        const hashed = await bcrypt.hash(password, 10);
        // Public registration is limited to customer accounts.
        const user = new User({ name, email, password: hashed, phone: normalizedPhone, role: "customer" });
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, "SECRET123");
        res.json({ message: "User registered", token, role: user.role });
    } catch (err) {
        // Handle unique index race conditions or other errors
        if (err.code === 11000) {
            return res.status(409).json({ error: "User already exists" });
        }
        res.status(500).json({ error: "Registration failed" });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) return res.status(404).json({ error: "User not found" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: "Incorrect password" });

        const token = jwt.sign({ id: user._id, role: user.role }, "SECRET123");
        res.json({ token, role: user.role });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});

// Get User Profile
router.get("/profile", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        const decoded = jwt.verify(token, "SECRET123");
        const user = await User.findById(decoded.id).select("-password");
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

// Admin Registration
router.post("/admin/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email and password are required" });
        }

        const pwdCheck = validatePasswordStrength(password);
        if (!pwdCheck.isStrong) {
            let errorMsg = 'This is a weak password. ';
            if (!pwdCheck.hasMinLength) errorMsg += 'Password must be at least 6 characters. ';
            if (!pwdCheck.hasSpecialChar) errorMsg += 'Password must contain a special character (!@#$%^&*-_=+). ';
            return res.status(400).json({ error: errorMsg });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(409).json({ error: "Email already registered" });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = new User({ name, email: normalizedEmail, password: hashed, role: "admin" });
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, "SECRET123");
        res.json({ message: "Admin registered", token, role: user.role });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: "Email already registered" });
        }
        res.status(500).json({ error: "Admin registration failed" });
    }
});

// Admin Login
router.post("/admin/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim(), role: "admin" });
        if (!user) return res.status(404).json({ error: "Admin not found" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: "Incorrect password" });

        const token = jwt.sign({ id: user._id, role: user.role }, "SECRET123");
        res.json({ token, role: user.role });
    } catch (err) {
        res.status(500).json({ error: "Admin login failed" });
    }
});

module.exports = router;
