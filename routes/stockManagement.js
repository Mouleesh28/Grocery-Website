const express = require("express");
const Product = require("../config/models/Product");

const router = express.Router();

// Get Stock Summary for a Shop
router.get("/shop/:shopId", async (req, res) => {
    try {
        const { shopId } = req.params;
        
        const products = await Product.find({ shopId });
        
        if (!products.length) {
            return res.status(404).json({ message: "No products found for this shop" });
        }
        
        const totalItems = products.reduce((sum, p) => sum + p.stock, 0);
        const outOfStock = products.filter(p => p.stock === 0).length;
        const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
        
        const summary = {
            shopId,
            totalProducts: products.length,
            totalStock: totalItems,
            outOfStockItems: outOfStock,
            lowStockItems: lowStock,
            products: products
        };
        
        res.json(summary);
    } catch (error) {
        console.error('Error fetching stock summary:', error);
        res.status(500).json({ message: "Failed to fetch stock summary", error: error.message });
    }
});

// Get Low Stock Items for Shop (stock <= 10)
router.get("/shop/:shopId/low-stock", async (req, res) => {
    try {
        const { shopId } = req.params;
        const threshold = req.query.threshold || 10;
        
        const lowStockProducts = await Product.find({
            shopId,
            stock: { $lte: threshold, $gt: 0 }
        }).sort({ stock: 1 });
        
        res.json({
            shopId,
            threshold,
            count: lowStockProducts.length,
            products: lowStockProducts
        });
    } catch (error) {
        console.error('Error fetching low stock items:', error);
        res.status(500).json({ message: "Failed to fetch low stock items", error: error.message });
    }
});

// Get Out of Stock Items for Shop
router.get("/shop/:shopId/out-of-stock", async (req, res) => {
    try {
        const { shopId } = req.params;
        
        const outOfStockProducts = await Product.find({
            shopId,
            stock: 0
        });
        
        res.json({
            shopId,
            count: outOfStockProducts.length,
            products: outOfStockProducts
        });
    } catch (error) {
        console.error('Error fetching out of stock items:', error);
        res.status(500).json({ message: "Failed to fetch out of stock items", error: error.message });
    }
});

// Update Stock for Specific Product
router.put("/update/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity, action } = req.body; // action: 'set', 'add', 'subtract'
        
        if (!quantity || quantity < 0) {
            return res.status(400).json({ message: "Valid quantity is required" });
        }
        
        if (!action || !['set', 'add', 'subtract'].includes(action)) {
            return res.status(400).json({ message: "Action must be 'set', 'add', or 'subtract'" });
        }
        
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        let newStock;
        
        switch(action) {
            case 'set':
                newStock = quantity;
                break;
            case 'add':
                newStock = product.stock + quantity;
                break;
            case 'subtract':
                newStock = product.stock - quantity;
                if (newStock < 0) {
                    return res.status(400).json({ message: "Cannot subtract more than available stock" });
                }
                break;
        }
        
        product.stock = newStock;
        await product.save();
        
        res.json({
            message: `Stock ${action}ed successfully`,
            product,
            oldStock: action === 'set' ? quantity : product.stock,
            newStock
        });
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ message: "Failed to update stock", error: error.message });
    }
});

// Bulk Update Stock
router.post("/bulk-update", async (req, res) => {
    try {
        const { updates } = req.body; // Array of { productId, quantity, action }
        
        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({ message: "Updates array is required" });
        }
        
        const results = [];
        const errors = [];
        
        for (const update of updates) {
            try {
                const { productId, quantity, action } = update;
                
                if (!productId || quantity === undefined || !action) {
                    errors.push({ productId, error: "Missing required fields" });
                    continue;
                }
                
                const product = await Product.findById(productId);
                if (!product) {
                    errors.push({ productId, error: "Product not found" });
                    continue;
                }
                
                let newStock;
                const oldStock = product.stock;
                
                switch(action) {
                    case 'set':
                        newStock = quantity;
                        break;
                    case 'add':
                        newStock = product.stock + quantity;
                        break;
                    case 'subtract':
                        newStock = product.stock - quantity;
                        if (newStock < 0) {
                            errors.push({ productId, error: "Cannot subtract more than available stock" });
                            continue;
                        }
                        break;
                    default:
                        errors.push({ productId, error: "Invalid action" });
                        continue;
                }
                
                product.stock = newStock;
                await product.save();
                
                results.push({
                    productId,
                    name: product.name,
                    oldStock,
                    newStock,
                    action,
                    status: "success"
                });
            } catch (err) {
                errors.push({ productId: update.productId, error: err.message });
            }
        }
        
        res.json({
            message: "Bulk update completed",
            successful: results.length,
            failed: errors.length,
            results,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Error in bulk update:', error);
        res.status(500).json({ message: "Failed to complete bulk update", error: error.message });
    }
});

// Stock Report by Category for Shop
router.get("/shop/:shopId/report-by-category", async (req, res) => {
    try {
        const { shopId } = req.params;
        
        const products = await Product.find({ shopId });
        
        if (!products.length) {
            return res.status(404).json({ message: "No products found for this shop" });
        }
        
        const categoryReport = {};
        
        products.forEach(product => {
            if (!categoryReport[product.category]) {
                categoryReport[product.category] = {
                    totalItems: 0,
                    totalValue: 0,
                    productCount: 0,
                    outOfStock: 0,
                    lowStock: 0
                };
            }
            
            categoryReport[product.category].totalItems += product.stock;
            categoryReport[product.category].totalValue += (product.stock * product.price);
            categoryReport[product.category].productCount += 1;
            
            if (product.stock === 0) {
                categoryReport[product.category].outOfStock += 1;
            } else if (product.stock <= 10) {
                categoryReport[product.category].lowStock += 1;
            }
        });
        
        res.json({
            shopId,
            generatedAt: new Date(),
            categories: categoryReport
        });
    } catch (error) {
        console.error('Error generating category report:', error);
        res.status(500).json({ message: "Failed to generate report", error: error.message });
    }
});

// Stock Valuation Report for Shop
router.get("/shop/:shopId/valuation", async (req, res) => {
    try {
        const { shopId } = req.params;
        
        const products = await Product.find({ shopId });
        
        if (!products.length) {
            return res.status(404).json({ message: "No products found for this shop" });
        }
        
        let totalInventoryValue = 0;
        const valuationDetails = products.map(product => {
            const itemValue = product.stock * product.price;
            totalInventoryValue += itemValue;
            return {
                productId: product._id,
                name: product.name,
                category: product.category,
                quantity: product.stock,
                unitPrice: product.price,
                totalValue: itemValue
            };
        });
        
        const avgValue = totalInventoryValue / products.length;
        const topProducts = valuationDetails.sort((a, b) => b.totalValue - a.totalValue).slice(0, 5);
        
        res.json({
            shopId,
            generatedAt: new Date(),
            totalInventoryValue,
            averageProductValue: avgValue,
            totalProducts: products.length,
            topValuedProducts: topProducts,
            detailedValuation: valuationDetails
        });
    } catch (error) {
        console.error('Error generating valuation report:', error);
        res.status(500).json({ message: "Failed to generate valuation report", error: error.message });
    }
});

// Restock Alert - Items that need restocking
router.post("/restock-alert/:shopId", async (req, res) => {
    try {
        const { shopId } = req.params;
        const { threshold = 10, minOrderQty = 50 } = req.body;
        
        const productsNeedingRestock = await Product.find({
            shopId,
            stock: { $lte: threshold }
        }).sort({ stock: 1 });
        
        const restockPlan = productsNeedingRestock.map(product => ({
            productId: product._id,
            name: product.name,
            category: product.category,
            currentStock: product.stock,
            suggestedOrderQty: minOrderQty,
            urgency: product.stock === 0 ? 'Critical' : product.stock <= 5 ? 'High' : 'Medium'
        }));
        
        res.json({
            shopId,
            threshold,
            restockItems: restockPlan.length,
            estimatedCost: restockPlan.reduce((sum, item) => {
                const product = productsNeedingRestock.find(p => p._id.toString() === item.productId.toString());
                return sum + (item.suggestedOrderQty * product.price);
            }, 0),
            restockPlan
        });
    } catch (error) {
        console.error('Error generating restock alert:', error);
        res.status(500).json({ message: "Failed to generate restock alert", error: error.message });
    }
});

module.exports = router;
