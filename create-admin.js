const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./config/models/User");

// MongoDB connection
const MONGO_URI = "mongodb://127.0.0.1:27017/grocery-delivery";

async function createAdmin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: "admin@grocery.com" });
        
        if (existingAdmin) {
            console.log("⚠️ Admin user already exists!");
            console.log("Email: admin@grocery.com");
            console.log("Use existing password or delete the user first.");
            process.exit(0);
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash("admin123", 10);
        
        const admin = new User({
            name: "Admin User",
            email: "admin@grocery.com",
            password: hashedPassword,
            role: "admin"
        });

        await admin.save();
        
        console.log("\n✅ Admin user created successfully!");
        console.log("==========================================");
        console.log("📧 Email: admin@grocery.com");
        console.log("🔑 Password: admin123");
        console.log("==========================================");
        console.log("\nYou can now login with these credentials.");
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error creating admin:", error);
        process.exit(1);
    }
}

createAdmin();
