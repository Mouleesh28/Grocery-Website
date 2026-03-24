const mongoose = require("mongoose");

function getMongoUri() {
    const envUri = String(process.env.MONGO_URI || "").trim();
    if (envUri) {
        return envUri;
    }

    // Keep local development working even when Atlas SRV DNS is blocked.
    return "mongodb://127.0.0.1:27017/grocery-delivery";
}

const connectDB = async () => {
    try {
        await mongoose.connect(getMongoUri(), {
            serverSelectionTimeoutMS: 10000
        });
        console.log("MongoDB Connected");
    } catch (error) {
        if (error && error.code === "ECONNREFUSED" && error.syscall === "querySrv") {
            console.error("MongoDB SRV DNS lookup failed. Use a local MongoDB instance or set MONGO_URI to a non-SRV connection string.");
        }
        process.exit(1);
    }
};

module.exports = connectDB;
