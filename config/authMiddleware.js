const jwt = require("jsonwebtoken");
const User = require("./models/User");

/**
 * Authentication middleware to verify JWT token
 */
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        
        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        const decoded = jwt.verify(token, "SECRET123");
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(401).json({ error: "Authentication failed" });
    }
};

/**
 * Admin authorization middleware (requires admin role)
 */
const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access only" });
    }
    next();
};

module.exports = { authMiddleware, adminOnly };
