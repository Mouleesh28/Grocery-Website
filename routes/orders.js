const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../config/models/Order");
const Product = require("../config/models/Product");

const router = express.Router();

// Initialize Razorpay with your API keys
// Get these from https://dashboard.razorpay.com/
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_1DP5mmOlF5G5ag",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "w6pLP0MtznqWQvDNSmaBZ123"
});

// Add Order (validate stock & decrement)
router.post("/add", async (req, res) => {
    try {
        const { customerId, shopId, products, totalAmount, paymentMode, paymentMethod } = req.body;
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: "No products in order" });
        }
        
        // Validate stock
        for (const item of products) {
            const prod = await Product.findById(item.id || item._id);
            if (!prod) {
                return res.status(404).json({ message: `Product not found: ${item.name}` });
            }
            const qty = Number(item.quantity || 0);
            if (qty <= 0) {
                return res.status(400).json({ message: `Invalid quantity for ${item.name}` });
            }
            if (prod.stock < qty) {
                return res.status(400).json({ message: `Insufficient stock for ${prod.name}. Available: ${prod.stock}` });
            }
        }
        
        // Decrement stock
        for (const item of products) {
            const prod = await Product.findById(item.id || item._id);
            prod.stock = prod.stock - Number(item.quantity);
            await prod.save();
        }
        
        // Create order
        const order = new Order({ customerId, shopId, products, totalAmount, paymentMode, paymentMethod, status: 'Pending' });
        await order.save();
        res.json({ message: "Order added", order });
    } catch (err) {
        console.error('Order add failed:', err);
        res.status(500).json({ message: "Failed to add order" });
    }
});

// Get All Orders
router.get("/", async (req, res) => {
    const orders = await Order.find();
    res.json(orders);
});

// Get Orders for a Shop
router.get("/shop/:shopId", async (req, res) => {
    try {
        const { shopId } = req.params;
        const orders = await Order.find({ shopId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch shop orders', error: err.message });
    }
});

// Update Order Status
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Pending | Approved | Rejected | Packed | Out for Delivery | Delivered
        if (!status) return res.status(400).json({ message: 'Status is required' });
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = status;
        if (status === 'Delivered') {
            order.paymentStatus = 'completed';
        }
        await order.save();
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Status updated', order });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update status', error: err.message });
    }
});

// Create Razorpay Order for online payment
router.post("/create-payment-order", async (req, res) => {
    try {
        const { customerId, shopId, products, totalAmount, paymentMethod } = req.body;
        
        console.log('Creating payment order:', { customerId, shopId, totalAmount, paymentMethod });
        
        if (!totalAmount || totalAmount <= 0) {
            return res.status(400).json({ message: "Invalid amount" });
        }
        
        if (!products || products.length === 0) {
            return res.status(400).json({ message: "No products in cart" });
        }
        
        try {
            // Create Razorpay order
            const razorpayOrder = await razorpay.orders.create({
                amount: Math.round(totalAmount * 100), // Razorpay expects amount in paise
                currency: "INR",
                receipt: `order_${Date.now()}`,
                notes: {
                    customerId: customerId,
                    shopId: shopId,
                    paymentMethod: paymentMethod || "online"
                }
            });
            
            console.log('Razorpay order created:', razorpayOrder.id);
            
            // Create order in database with payment status
            const order = new Order({
                customerId,
                shopId,
                products,
                totalAmount,
                paymentMode: "online",
                paymentMethod: paymentMethod || "online",
                status: "Pending",
                paymentStatus: "pending",
                razorpayOrderId: razorpayOrder.id
            });
            
            await order.save();
            console.log('Order saved to database:', order._id);
            
            res.json({
                message: "Payment order created",
                orderId: order._id,
                razorpayOrderId: razorpayOrder.id,
                amount: totalAmount,
                currency: "INR",
                keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_1DP5mmOlF5G5ag"
            });
        } catch (razorpayError) {
            console.error('Razorpay API Error:', razorpayError);
            throw new Error(`Razorpay error: ${razorpayError.message}`);
        }
    } catch (error) {
        console.error('Payment order creation failed:', error);
        res.status(500).json({ 
            message: "Failed to create payment order", 
            error: error.message,
            details: error.stack 
        });
    }
});

// Verify Payment and Update Order Status
router.post("/verify-payment", async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
        
        // Verify the signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "w6pLP0MtznqWQvDNSmaBZ123")
            .update(body)
            .digest("hex");
        
        const isValidSignature = expectedSignature === razorpay_signature;
        
        if (!isValidSignature) {
            return res.status(400).json({ message: "Invalid payment signature", paymentValid: false });
        }
        
        // Update order with payment details
        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                paymentStatus: "completed",
                status: "Approved"
            },
            { new: true }
        );
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        res.json({
            message: "Payment verified successfully",
            paymentValid: true,
            order
        });
    } catch (error) {
        console.error('Payment verification failed:', error);
        res.status(500).json({ message: "Payment verification failed", error: error.message });
    }
});

// Handle Payment Failure
router.post("/payment-failed", async (req, res) => {
    try {
        const { orderId } = req.body;
        
        const order = await Order.findByIdAndUpdate(
            orderId,
            { paymentStatus: "failed", status: "Pending" },
            { new: true }
        );
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        // Restore product stock
        for (const item of order.products) {
            const product = await Product.findById(item.id || item._id);
            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }
        
        res.json({ message: "Payment marked as failed", order });
    } catch (error) {
        console.error('Payment failure handling failed:', error);
        res.status(500).json({ message: "Failed to handle payment failure", error: error.message });
    }
});

module.exports = router;