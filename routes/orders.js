const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../config/models/Order");
const Product = require("../config/models/Product");

const router = express.Router();

function getRazorpayConfig() {
    const keyId = String(process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY || "").trim();
    const keySecret = String(
        process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET || process.env.RAZORPAY_SECRET_KEY || ""
    ).trim();

    return { keyId, keySecret };
}

function hasRazorpayConfig() {
    const { keyId, keySecret } = getRazorpayConfig();
    const invalidValues = new Set([
        "",
        "undefined",
        "null",
        "your_test_key_id_here",
        "your_test_secret_here",
        "rzp_test_your_key_id",
        "rzp_test_1DP5mmOlF5G5ag",
        "w6pLP0MtznqWQvDNSmaBZ123"
    ]);
    return !invalidValues.has(keyId) && !invalidValues.has(keySecret);
}

function getRazorpayClient() {
    if (!hasRazorpayConfig()) {
        throw new Error("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env");
    }

    const { keyId, keySecret } = getRazorpayConfig();

    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret
    });
}

async function validateStockAvailability(products) {
    if (!Array.isArray(products) || products.length === 0) {
        throw new Error("No products in order");
    }

    for (const item of products) {
        const product = await Product.findById(item.id || item._id);
        if (!product) {
            throw new Error(`Product not found: ${item.name || item.id || item._id}`);
        }

        const qty = Number(item.quantity || 0);
        if (qty <= 0) {
            throw new Error(`Invalid quantity for ${item.name || product.name}`);
        }

        if (product.stock < qty) {
            throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
        }
    }
}

async function decrementStock(products) {
    for (const item of products) {
        const product = await Product.findById(item.id || item._id);
        if (!product) {
            throw new Error(`Product not found while reducing stock: ${item.name || item.id || item._id}`);
        }

        const qty = Number(item.quantity || 0);
        if (qty <= 0) {
            throw new Error(`Invalid quantity while reducing stock for ${item.name || product.name}`);
        }

        if (product.stock < qty) {
            throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
        }

        product.stock -= qty;
        await product.save();
    }
}

async function restoreStock(products) {
    for (const item of products) {
        const product = await Product.findById(item.id || item._id);
        if (!product) continue;

        const qty = Number(item.quantity || 0);
        if (qty <= 0) continue;

        product.stock += qty;
        await product.save();
    }
}

// Add Order (validate stock & decrement)
router.post("/add", async (req, res) => {
    try {
        const { customerId, shopId, products, totalAmount, paymentMode, paymentMethod } = req.body;

        await validateStockAvailability(products);
        await decrementStock(products);
        
        // Create order
        const order = new Order({
            customerId,
            shopId,
            products,
            totalAmount,
            paymentMode,
            paymentMethod,
            status: 'Pending',
            stockAdjusted: true
        });
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

        if (!hasRazorpayConfig()) {
            return res.status(500).json({
                message: "Online payment is not configured on the server. Please set Razorpay keys."
            });
        }
        
        console.log('Creating payment order:', { customerId, shopId, totalAmount, paymentMethod });
        
        if (!totalAmount || totalAmount <= 0) {
            return res.status(400).json({ message: "Invalid amount" });
        }
        
        if (!products || products.length === 0) {
            return res.status(400).json({ message: "No products in cart" });
        }

        await validateStockAvailability(products);
        
        try {
            const razorpay = getRazorpayClient();
            const { keyId } = getRazorpayConfig();

            // Create Razorpay order
            const razorpayOrder = await razorpay.orders.create({
                amount: Math.round(totalAmount * 100), // Razorpay expects amount in paise
                currency: "INR",
                receipt: `order_${Date.now()}`,
                notes: {
                    customerId: customerId,
                    shopId: shopId,
                    paymentMethod: paymentMethod || "razorpay"
                }
            });
            
            console.log('Razorpay order created:', razorpayOrder.id);
            
            // Create order in database with payment status
            const order = new Order({
                customerId,
                shopId,
                products,
                totalAmount,
                paymentMode: "razorpay",
                paymentMethod: paymentMethod || "razorpay",
                status: "Pending",
                paymentStatus: "pending",
                stockAdjusted: false,
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
                keyId
            });
        } catch (razorpayError) {
            console.error('Razorpay API Error:', razorpayError);

            if (!hasRazorpayConfig()) {
                throw new Error("Razorpay is not configured. Set valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env");
            }

            const reason = razorpayError?.error?.description || razorpayError?.description || razorpayError?.message || "Unknown Razorpay error";
            if (String(reason).toLowerCase().includes("authentication failed")) {
                throw new Error("Razorpay authentication failed. Replace RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env with your own Test keys from dashboard.razorpay.com");
            }
            throw new Error(`Razorpay error: ${reason}`);
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

        if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: "Missing payment verification details" });
        }

        if (!hasRazorpayConfig()) {
            return res.status(500).json({
                message: "Payment verification is not configured on the server."
            });
        }

        const { keySecret } = getRazorpayConfig();
        
        // Verify the signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", keySecret)
            .update(body)
            .digest("hex");
        
        const isValidSignature = expectedSignature === razorpay_signature;
        
        if (!isValidSignature) {
            return res.status(400).json({ message: "Invalid payment signature", paymentValid: false });
        }
        
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Idempotent success response for repeated callback/verification requests.
        if (order.paymentStatus === "completed" && order.stockAdjusted) {
            return res.json({
                message: "Payment already verified",
                paymentValid: true,
                order
            });
        }

        if (order.razorpayOrderId && order.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({ message: "Razorpay order mismatch", paymentValid: false });
        }

        await validateStockAvailability(order.products);
        await decrementStock(order.products);

        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        order.paymentStatus = "completed";
        order.status = "Approved";
        order.stockAdjusted = true;
        await order.save();
        
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

        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.stockAdjusted) {
            await restoreStock(order.products);
            order.stockAdjusted = false;
        }

        order.paymentStatus = "failed";
        order.status = "Pending";
        await order.save();
        
        res.json({ message: "Payment marked as failed", order });
    } catch (error) {
        console.error('Payment failure handling failed:', error);
        res.status(500).json({ message: "Failed to handle payment failure", error: error.message });
    }
});

module.exports = router;