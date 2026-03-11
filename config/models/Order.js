const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    customerId: String,
    shopId: String,
    products: [],
    totalAmount: Number,
    paymentMode: String, // "online" or "cod"
    paymentMethod: String, // "online", "gpay", "phonepe", "paytm"
    status: { type: String, default: "Pending" },
    paymentStatus: { type: String, default: "pending", enum: ["pending", "completed", "failed", "cancelled"] },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);