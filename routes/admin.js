const express = require("express");
const Order = require("../config/models/Order");
const Product = require("../config/models/Product");
const { authMiddleware, adminOnly } = require("../config/authMiddleware");

const router = express.Router();

// Apply authentication and admin check to all routes
router.use(authMiddleware);
router.use(adminOnly);

/**
 * GET /api/admin/sales-summary
 * Fetch overall sales summary (total sales, revenue, best-selling products)
 */
router.get("/sales-summary", async (req, res) => {
    try {
        const orders = await Order.find({
            paymentStatus: { $in: ["completed", "pending"] }
        });

        let totalSales = 0;
        let totalRevenue = 0;
        const productSalesMap = {}; // { productId: { name, category, qty, revenue } }

        // Process each order
        for (const order of orders) {
            totalSales += 1;
            totalRevenue += order.totalAmount || 0;

            // Aggregate product sales
            for (const item of order.products) {
                const productId = item.id || item._id;
                const qty = Number(item.quantity) || 0;
                const price = Number(item.price) || 0;
                const revenue = qty * price;

                if (!productSalesMap[productId]) {
                    productSalesMap[productId] = {
                        id: productId,
                        name: item.name,
                        category: item.category,
                        quantitySold: 0,
                        totalRevenue: 0,
                        avgPrice: price
                    };
                }

                productSalesMap[productId].quantitySold += qty;
                productSalesMap[productId].totalRevenue += revenue;
            }
        }

        // Get top 5 best-selling products
        const bestSellingProducts = Object.values(productSalesMap)
            .sort((a, b) => b.quantitySold - a.quantitySold)
            .slice(0, 5);

        // Get top 5 revenue-generating products
        const topRevenueProducts = Object.values(productSalesMap)
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 5);

        res.json({
            totalSales,
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            totalOrdersProcessed: orders.length,
            bestSellingProducts,
            topRevenueProducts,
            timestamp: new Date()
        });
    } catch (error) {
        console.error("Error fetching sales summary:", error);
        res.status(500).json({ message: "Failed to fetch sales summary", error: error.message });
    }
});

/**
 * GET /api/admin/product-sales
 * Fetch product-wise sales data for bar chart
 */
router.get("/product-sales", async (req, res) => {
    try {
        const orders = await Order.find({
            paymentStatus: { $in: ["completed", "pending"] }
        });

        const productSalesMap = {};

        for (const order of orders) {
            for (const item of order.products) {
                const productId = item.id || item._id;
                const qty = Number(item.quantity) || 0;
                const price = Number(item.price) || 0;

                if (!productSalesMap[productId]) {
                    productSalesMap[productId] = {
                        id: productId,
                        name: item.name,
                        category: item.category,
                        quantitySold: 0,
                        totalRevenue: 0
                    };
                }

                productSalesMap[productId].quantitySold += qty;
                productSalesMap[productId].totalRevenue += qty * price;
            }
        }

        // Get top 15 products by quantity sold
        const productSalesData = Object.values(productSalesMap)
            .sort((a, b) => b.quantitySold - a.quantitySold)
            .slice(0, 15);

        const labels = productSalesData.map(p => p.name);
        const quantities = productSalesData.map(p => p.quantitySold);
        const revenues = productSalesData.map(p => Math.round(p.totalRevenue * 100) / 100);
        const categories = productSalesData.map(p => p.category);

        res.json({
            labels,
            quantities,
            revenues,
            categories,
            data: productSalesData
        });
    } catch (error) {
        console.error("Error fetching product sales:", error);
        res.status(500).json({ message: "Failed to fetch product sales", error: error.message });
    }
});

/**
 * GET /api/admin/sales-trends
 * Fetch daily/monthly sales trends for line chart
 */
router.get("/sales-trends", async (req, res) => {
    try {
        const { period } = req.query; // "daily" or "monthly"
        const timeFrame = period === "monthly" ? "monthly" : "daily";

        const orders = await Order.find({
            paymentStatus: { $in: ["completed", "pending"] }
        }).sort({ createdAt: 1 });

        const trendsMap = {}; // { "2025-01-15" or "2025-01": { revenue, count } }

        for (const order of orders) {
            const date = new Date(order.createdAt);
            let key;

            if (timeFrame === "monthly") {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            } else {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            }

            if (!trendsMap[key]) {
                trendsMap[key] = { revenue: 0, count: 0 };
            }

            trendsMap[key].revenue += order.totalAmount || 0;
            trendsMap[key].count += 1;
        }

        // Sort by date
        const sortedDates = Object.keys(trendsMap).sort();
        const labels = sortedDates;
        const revenues = sortedDates.map(date => Math.round(trendsMap[date].revenue * 100) / 100);
        const counts = sortedDates.map(date => trendsMap[date].count);

        res.json({
            timeFrame,
            labels,
            revenues,
            counts,
            data: sortedDates.map(date => ({
                date,
                revenue: trendsMap[date].revenue,
                orderCount: trendsMap[date].count
            }))
        });
    } catch (error) {
        console.error("Error fetching sales trends:", error);
        res.status(500).json({ message: "Failed to fetch sales trends", error: error.message });
    }
});

/**
 * GET /api/admin/category-sales
 * Fetch category-wise sales distribution for pie chart
 */
router.get("/category-sales", async (req, res) => {
    try {
        const orders = await Order.find({
            paymentStatus: { $in: ["completed", "pending"] }
        });

        const categorySalesMap = {}; // { "fruits": { quantity, revenue } }

        for (const order of orders) {
            for (const item of order.products) {
                const category = item.category || "uncategorized";
                const qty = Number(item.quantity) || 0;
                const price = Number(item.price) || 0;

                if (!categorySalesMap[category]) {
                    categorySalesMap[category] = { quantity: 0, revenue: 0 };
                }

                categorySalesMap[category].quantity += qty;
                categorySalesMap[category].revenue += qty * price;
            }
        }

        const labels = Object.keys(categorySalesMap);
        const quantities = labels.map(cat => categorySalesMap[cat].quantity);
        const revenues = labels.map(cat => Math.round(categorySalesMap[cat].revenue * 100) / 100);

        // Color palette for pie chart
        const colors = [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
            "#FF6384",
            "#C9CBCF",
            "#4BC0C0",
            "#FF9F40"
        ];

        res.json({
            labels,
            quantities,
            revenues,
            colors: colors.slice(0, labels.length),
            data: labels.map((cat, idx) => ({
                category: cat,
                quantity: categorySalesMap[cat].quantity,
                revenue: categorySalesMap[cat].revenue,
                color: colors[idx % colors.length]
            }))
        });
    } catch (error) {
        console.error("Error fetching category sales:", error);
        res.status(500).json({ message: "Failed to fetch category sales", error: error.message });
    }
});

/**
 * GET /api/admin/analytics
 * Comprehensive analytics combining all metrics
 */
router.get("/analytics", async (req, res) => {
    try {
        // Run all queries in parallel
        const [salesSummaryRes, productSalesRes, salesTrendsRes, categorySalesRes] = await Promise.all([
            Order.find({
                paymentStatus: { $in: ["completed", "pending"] }
            }).lean(),
            Order.find({
                paymentStatus: { $in: ["completed", "pending"] }
            }).lean(),
            Order.find({
                paymentStatus: { $in: ["completed", "pending"] }
            }).sort({ createdAt: 1 }).lean(),
            Order.find({
                paymentStatus: { $in: ["completed", "pending"] }
            }).lean()
        ]);

        // Calculate summary metrics
        let totalRevenue = 0;
        const productMap = {};
        const categoryMap = {};
        const dailyTrends = {};

        for (const order of salesSummaryRes) {
            totalRevenue += order.totalAmount || 0;

            for (const item of order.products) {
                const productId = item.id || item._id;
                const qty = Number(item.quantity) || 0;
                const price = Number(item.price) || 0;
                const category = item.category || "uncategorized";

                // Product tracking
                if (!productMap[productId]) {
                    productMap[productId] = {
                        name: item.name,
                        category,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productMap[productId].quantity += qty;
                productMap[productId].revenue += qty * price;

                // Category tracking
                if (!categoryMap[category]) {
                    categoryMap[category] = { quantity: 0, revenue: 0 };
                }
                categoryMap[category].quantity += qty;
                categoryMap[category].revenue += qty * price;
            }

            // Daily trends
            const date = new Date(order.createdAt);
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            if (!dailyTrends[dateKey]) {
                dailyTrends[dateKey] = { revenue: 0, count: 0 };
            }
            dailyTrends[dateKey].revenue += order.totalAmount || 0;
            dailyTrends[dateKey].count += 1;
        }

        const bestProducts = Object.entries(productMap)
            .sort((a, b) => b[1].quantity - a[1].quantity)
            .slice(0, 5)
            .map(([id, data]) => ({ id, ...data }));

        const categoryDistribution = Object.entries(categoryMap)
            .map(([name, data]) => ({ name, ...data }));

        res.json({
            summary: {
                totalOrders: salesSummaryRes.length,
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                avgOrderValue: salesSummaryRes.length > 0 ? Math.round((totalRevenue / salesSummaryRes.length) * 100) / 100 : 0,
                totalProductsSold: Object.values(productMap).reduce((sum, p) => sum + p.quantity, 0)
            },
            bestSellingProducts: bestProducts,
            categoryDistribution,
            dailyTrends: Object.entries(dailyTrends)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([date, data]) => ({ date, ...data }))
                .slice(-30) // Last 30 days
        });
    } catch (error) {
        console.error("Error fetching comprehensive analytics:", error);
        res.status(500).json({ message: "Failed to fetch analytics", error: error.message });
    }
});

/**
 * POST /api/admin/products
 * Add a new product
 */
router.post("/products", async (req, res) => {
    try {
        const { name, category, price, stock, image } = req.body;

        // Validation
        if (!name || !category || !price || stock === undefined) {
            return res.status(400).json({
                message: "Name, category, price, and stock are required"
            });
        }

        if (price < 0 || stock < 0) {
            return res.status(400).json({
                message: "Price and stock must be non-negative"
            });
        }

        // Create product
        const product = new Product({
            name,
            category,
            price: parseFloat(price),
            stock: parseInt(stock),
            image: image || "https://images.unsplash.com/photo-1599599810694-e5f8c1d7b4b5?auto=format&fit=crop&w=800&q=80",
            shopId: "admin"
        });

        await product.save();

        res.json({
            message: "Product added successfully",
            product: {
                id: product._id,
                name: product.name,
                category: product.category,
                price: product.price,
                stock: product.stock
            }
        });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({
            message: "Failed to add product",
            error: error.message
        });
    }
});

/**
 * DELETE /api/admin/products/:id
 * Delete a product
 */
router.delete("/products/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product deleted successfully",
            productId: id
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({
            message: "Failed to delete product",
            error: error.message
        });
    }
});

/**
 * POST /api/admin/seed-orders
 * Create sample orders for testing the dashboard
 */
router.post("/seed-orders", async (req, res) => {
    try {
        // Clear existing test orders
        await Order.deleteMany({ customerId: "test-user" });

        // Create sample products data
        const sampleProducts = [
            { id: 'p1', name: 'Fresh Apples (1kg)', price: 120, quantity: 5, category: 'fruits' },
            { id: 'p2', name: 'Bananas (1 Dozen)', price: 60, quantity: 8, category: 'fruits' },
            { id: 'p3', name: 'Tomatoes (1kg)', price: 45, quantity: 12, category: 'vegetables' },
            { id: 'p4', name: 'Onions (1kg)', price: 35, quantity: 10, category: 'vegetables' },
            { id: 'p5', name: 'Basmati Rice (5kg)', price: 520, quantity: 3, category: 'grains' },
            { id: 'p6', name: 'Milk (1L)', price: 55, quantity: 15, category: 'dairy' },
            { id: 'p7', name: 'Eggs (6 pack)', price: 65, quantity: 20, category: 'dairy' },
            { id: 'p8', name: 'Sunflower Oil (1L)', price: 150, quantity: 4, category: 'oils' }
        ];

        // Create orders for the last 15 days
        const orders = [];
        for (let i = 0; i < 15; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(Math.floor(Math.random() * 24), 0, 0, 0);

            // Random number of items per order (1-5)
            const itemCount = Math.floor(Math.random() * 4) + 1;
            const orderProducts = [];
            let totalAmount = 0;

            for (let j = 0; j < itemCount; j++) {
                const product = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
                const qty = Math.floor(Math.random() * 3) + 1;
                const amount = product.price * qty;
                
                orderProducts.push({
                    ...product,
                    quantity: qty
                });
                
                totalAmount += amount;
            }

            const order = new Order({
                customerId: 'test-user',
                shopId: 'default',
                products: orderProducts,
                totalAmount: totalAmount,
                paymentMode: Math.random() > 0.5 ? 'online' : 'cod',
                paymentMethod: Math.random() > 0.5 ? 'online' : 'gpay',
                status: 'Delivered',
                paymentStatus: Math.random() > 0.3 ? 'completed' : 'pending',
                createdAt: date
            });

            orders.push(order);
        }

        // Save all orders
        await Order.insertMany(orders);

        res.json({
            message: `✅ Successfully created ${orders.length} sample orders for dashboard testing`,
            ordersCreated: orders.length
        });
    } catch (error) {
        console.error("Error seeding orders:", error);
        res.status(500).json({
            message: "Failed to seed orders",
            error: error.message
        });
    }
});

module.exports = router;
