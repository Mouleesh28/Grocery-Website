#!/usr/bin/env node
/**
 * Quick script to seed sample orders for dashboard testing
 * Usage: node seed-dashboard.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Models
const Order = require('./config/models/Order');
const db = require('./config/db');

// Connect to database
db();

async function seedOrders() {
    try {
        console.log('🌱 Seeding sample orders...\n');

        // Clear existing test orders
        await Order.deleteMany({ customerId: 'test-user' });
        console.log('✓ Cleared previous test data');

        // Sample products
        const sampleProducts = [
            { id: 'p1', name: 'Fresh Apples (1kg)', price: 120, quantity: 5, category: 'fruits' },
            { id: 'p2', name: 'Bananas (1 Dozen)', price: 60, quantity: 8, category: 'fruits' },
            { id: 'p3', name: 'Oranges (1kg)', price: 90, quantity: 6, category: 'fruits' },
            { id: 'p4', name: 'Tomatoes (1kg)', price: 45, quantity: 12, category: 'vegetables' },
            { id: 'p5', name: 'Onions (1kg)', price: 35, quantity: 10, category: 'vegetables' },
            { id: 'p6', name: 'Potatoes (1kg)', price: 30, quantity: 15, category: 'vegetables' },
            { id: 'p7', name: 'Basmati Rice (5kg)', price: 520, quantity: 3, category: 'grains' },
            { id: 'p8', name: 'Wheat Flour (1kg)', price: 45, quantity: 7, category: 'grains' },
            { id: 'p9', name: 'Milk (1L)', price: 55, quantity: 15, category: 'dairy' },
            { id: 'p10', name: 'Eggs (6 pack)', price: 65, quantity: 20, category: 'dairy' },
            { id: 'p11', name: 'Sunflower Oil (1L)', price: 150, quantity: 4, category: 'oils' },
            { id: 'p12', name: 'Ghee (500g)', price: 320, quantity: 2, category: 'oils' }
        ];

        // Create orders for the last 20 days
        const orders = [];
        let totalOrders = 0;

        for (let i = 0; i < 20; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(Math.floor(Math.random() * 24), 0, 0, 0);

            // Create 1-3 orders per day
            const ordersPerDay = Math.floor(Math.random() * 3) + 1;

            for (let o = 0; o < ordersPerDay; o++) {
                const itemCount = Math.floor(Math.random() * 4) + 1;
                const orderProducts = [];
                let totalAmount = 0;

                // Add items to order
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
                    totalAmount: Math.round(totalAmount * 100) / 100,
                    paymentMode: Math.random() > 0.5 ? 'online' : 'cod',
                    paymentMethod: Math.random() > 0.5 ? 'online' : 'gpay',
                    status: 'Delivered',
                    paymentStatus: Math.random() > 0.3 ? 'completed' : 'pending',
                    createdAt: date,
                    updatedAt: date
                });

                orders.push(order);
                totalOrders++;
            }
        }

        // Save all orders
        await Order.insertMany(orders);

        console.log(`✓ Created ${totalOrders} sample orders`);
        console.log(`\n📊 Sample Data Summary:`);
        console.log('  - Orders: Last 20 days');
        console.log('  - Items per order: 1-4 products');
        console.log('  - Categories: fruits, vegetables, grains, dairy, oils');
        console.log('  - Payment status: Mix of completed and pending\n');
        console.log('✅ Dashboard is ready! Start your server and visit the admin dashboard.\n');

        // Display sample stats
        const stats = await Order.aggregate([
            {
                $match: {
                    customerId: 'test-user',
                    paymentStatus: { $in: ['completed', 'pending'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' },
                    avgOrderValue: { $avg: '$totalAmount' }
                }
            }
        ]);

        if (stats.length > 0) {
            const s = stats[0];
            console.log('📈 Generated Statistics:');
            console.log(`  - Total Orders: ${s.totalOrders}`);
            console.log(`  - Total Revenue: ₹${Math.round(s.totalRevenue)}`);
            console.log(`  - Average Order: ₹${Math.round(s.avgOrderValue)}\n`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
}

// Run the seed
seedOrders();
