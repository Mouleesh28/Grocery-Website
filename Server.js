const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/Products");
const orderRoutes = require("./routes/orders");
const stockManagementRoutes = require("./routes/stockManagement");
const adminRoutes = require("./routes/admin");
const Product = require("./config/models/Product");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const connectDB = require("./config/db");
connectDB();

// Seed default products
async function seedProducts() {
    try {
        const defaultProducts = [
                // Fruits - Tropical & Exotic
                { name: 'Fresh Apples (1kg)', price: 120, stock: 40, category: 'fruits', image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Bananas (1 Dozen)', price: 60, stock: 50, category: 'fruits', image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Oranges (1kg)', price: 90, stock: 35, category: 'fruits', image: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Grapes (500g)', price: 85, stock: 45, category: 'fruits', image: 'https://images.unsplash.com/photo-1599819177326-f537d2fae1c9?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Mango (1kg)', price: 150, stock: 30, category: 'fruits', image: 'https://images.unsplash.com/photo-1605635619311-762e6e82e7d9?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Strawberries (250g)', price: 110, stock: 25, category: 'fruits', image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Watermelon (1pc)', price: 200, stock: 20, category: 'fruits', image: 'https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Pomegranate (1kg)', price: 130, stock: 28, category: 'fruits', image: 'https://images.unsplash.com/photo-1547516060-e2ff0c5daa3f?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Pineapple (1pc)', price: 95, stock: 22, category: 'fruits', image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Kiwi (6pc)', price: 140, stock: 18, category: 'fruits', image: 'https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Papaya (1kg)', price: 75, stock: 32, category: 'fruits', image: 'https://images.unsplash.com/photo-1603052378066-5b43c2f6e4e6?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Dragon Fruit (1pc)', price: 180, stock: 15, category: 'fruits', image: 'https://images.unsplash.com/photo-1527325678964-54921661f888?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Guava (500g)', price: 65, stock: 38, category: 'fruits', image: 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Peach (500g)', price: 125, stock: 24, category: 'fruits', image: 'https://images.unsplash.com/photo-1629828874514-944937187fe7?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Lemon (250g)', price: 35, stock: 55, category: 'fruits', image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Blueberries (250g)', price: 165, stock: 20, category: 'fruits', image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Raspberries (200g)', price: 140, stock: 18, category: 'fruits', image: 'https://images.unsplash.com/photo-1577068586014-f7500d6f5c90?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Blackberries (200g)', price: 130, stock: 15, category: 'fruits', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Coconut (1pc)', price: 75, stock: 25, category: 'fruits', image: 'https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Lime (500g)', price: 40, stock: 50, category: 'fruits', image: 'https://images.unsplash.com/photo-1582169296194-e4d644c48063?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Avocado (3pc)', price: 160, stock: 22, category: 'fruits', image: 'https://images.unsplash.com/photo-1523049673857-eb7a9fab033b?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Grapefruit (1kg)', price: 110, stock: 20, category: 'fruits', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Tangerine (1kg)', price: 100, stock: 30, category: 'fruits', image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Passion Fruit (250g)', price: 95, stock: 18, category: 'fruits', image: 'https://images.unsplash.com/photo-1596035154-f34532c0b33d?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Lychee (500g)', price: 145, stock: 20, category: 'fruits', image: 'https://images.unsplash.com/photo-1596105827928-6c193f7467dc?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Cherries (250g)', price: 175, stock: 15, category: 'fruits', image: 'https://images.unsplash.com/photo-1528821128474-27f963b062bf?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Plum (500g)', price: 95, stock: 25, category: 'fruits', image: 'https://images.unsplash.com/photo-1598881542050-85640cf3e825?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Apricot (500g)', price: 115, stock: 22, category: 'fruits', image: 'https://images.unsplash.com/photo-1619160311183-42f4f6f1c77a?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Date Palm (500g)', price: 185, stock: 18, category: 'fruits', image: 'https://images.unsplash.com/photo-1577069861033-55d04cec4ef5?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Figs (250g)', price: 155, stock: 16, category: 'fruits', image: 'https://images.unsplash.com/photo-1570155034046-0d8f5c77e5ec?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Mulberries (200g)', price: 125, stock: 14, category: 'fruits', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                
                // Vegetables - Leafy, Root, and Cruciferous
                { name: 'Tomatoes (1kg)', price: 45, stock: 80, category: 'vegetables', image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Onions (1kg)', price: 35, stock: 100, category: 'vegetables', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Potatoes (1kg)', price: 30, stock: 120, category: 'vegetables', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Broccoli (500g)', price: 55, stock: 35, category: 'vegetables', image: 'https://images.unsplash.com/photo-1584270354949-c26c2d6d8a7c?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Spinach (1 bunch)', price: 25, stock: 60, category: 'vegetables', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Carrots (1kg)', price: 40, stock: 95, category: 'vegetables', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Cauliflower (1pc)', price: 48, stock: 42, category: 'vegetables', image: 'https://images.unsplash.com/photo-1568584711271-61b82ce868d3?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Cabbage (1pc)', price: 35, stock: 50, category: 'vegetables', image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Bell Pepper (500g)', price: 70, stock: 38, category: 'vegetables', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Cucumber (500g)', price: 28, stock: 65, category: 'vegetables', image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Green Beans (500g)', price: 55, stock: 40, category: 'vegetables', image: 'https://images.unsplash.com/photo-1607609167725-b4d1c0c2e005?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Zucchini (500g)', price: 45, stock: 35, category: 'vegetables', image: 'https://images.unsplash.com/photo-1610868142317-237baa57342b?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Eggplant (600g)', price: 50, stock: 32, category: 'vegetables', image: 'https://images.unsplash.com/photo-1597823170239-634258f27806?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Peas (500g)', price: 65, stock: 28, category: 'vegetables', image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Corn (4 pieces)', price: 55, stock: 36, category: 'vegetables', image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Radish (500g)', price: 30, stock: 45, category: 'vegetables', image: 'https://images.unsplash.com/photo-1596560786007-1c98a5c7c68c?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Turnip (500g)', price: 35, stock: 38, category: 'vegetables', image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Beet (500g)', price: 40, stock: 32, category: 'vegetables', image: 'https://images.unsplash.com/photo-1606665673592-5b33a8086e0a?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Lettuce (1 bunch)', price: 35, stock: 50, category: 'vegetables', image: 'https://images.unsplash.com/photo-1622205313162-be1d5712a43f?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Kale (1 bunch)', price: 45, stock: 28, category: 'vegetables', image: 'https://images.unsplash.com/photo-1588610676056-6024f6e78952?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Bok Choy (500g)', price: 40, stock: 35, category: 'vegetables', image: 'https://images.unsplash.com/photo-1598030913794-c0f1db1b4bc8?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Celery (1 bunch)', price: 38, stock: 42, category: 'vegetables', image: 'https://images.unsplash.com/photo-1588804882411-f45a072d0083?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Okra (500g)', price: 45, stock: 30, category: 'vegetables', image: 'https://images.unsplash.com/photo-1604047934701-e42aa23fca78?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Asparagus (300g)', price: 75, stock: 22, category: 'vegetables', image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Brussels Sprouts (500g)', price: 60, stock: 25, category: 'vegetables', image: 'https://images.unsplash.com/photo-1616485969839-38ea6cb2d4d4?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Chili Peppers (250g)', price: 65, stock: 28, category: 'vegetables', image: 'https://images.unsplash.com/photo-1533636421800-34145c9e9e4e?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Garlic (250g)', price: 55, stock: 50, category: 'vegetables', image: 'https://images.unsplash.com/photo-1583090971480-64e6ee1ea877?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Ginger (250g)', price: 60, stock: 45, category: 'vegetables', image: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Coriander Leaves (1 bunch)', price: 20, stock: 60, category: 'vegetables', image: 'https://images.unsplash.com/photo-1613743983303-b3e89f8a7a2a?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Mint Leaves (1 bunch)', price: 22, stock: 58, category: 'vegetables', image: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Parsley (1 bunch)', price: 25, stock: 50, category: 'vegetables', image: 'https://images.unsplash.com/photo-1598030870867-a6685d1c30dc?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                
                // Grains - Rice, Wheat, Pulses, and Cereals
                { name: 'Whole Wheat Bread', price: 45, stock: 25, category: 'grains', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Basmati Rice (5kg)', price: 520, stock: 20, category: 'grains', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Wheat Flour (1kg)', price: 45, stock: 75, category: 'grains', image: 'https://images.unsplash.com/photo-1628502840903-8a11f2f83b04?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Pasta (500g)', price: 85, stock: 40, category: 'grains', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Oats (1kg)', price: 180, stock: 35, category: 'grains', image: 'https://images.unsplash.com/photo-1590432593976-e4e19b5a3fb3?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Popcorn Kernels (500g)', price: 65, stock: 28, category: 'grains', image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Brown Rice (5kg)', price: 380, stock: 18, category: 'grains', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Jasmine Rice (5kg)', price: 450, stock: 16, category: 'grains', image: 'https://images.unsplash.com/photo-1516211761931-e0a0f528449f?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'White Rice (5kg)', price: 340, stock: 22, category: 'grains', image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Sorghum Flour (1kg)', price: 55, stock: 25, category: 'grains', image: 'https://images.unsplash.com/photo-1574612330-14efa89b89ca?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Corn Flour (1kg)', price: 50, stock: 30, category: 'grains', image: 'https://images.unsplash.com/photo-1607672632458-9eb56696346b?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Barley (1kg)', price: 75, stock: 20, category: 'grains', image: 'https://images.unsplash.com/photo-1630617456364-c1fc2a20e007?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Rye Flour (1kg)', price: 85, stock: 18, category: 'grains', image: 'https://images.unsplash.com/photo-1573866838268-db6deaa54e86?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Quinoa (500g)', price: 185, stock: 15, category: 'grains', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Millet (1kg)', price: 95, stock: 16, category: 'grains', image: 'https://images.unsplash.com/photo-1617294464959-837ba368c4e3?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Buckwheat (1kg)', price: 110, stock: 14, category: 'grains', image: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Red Lentils (1kg)', price: 125, stock: 28, category: 'grains', image: 'https://images.unsplash.com/photo-1571942675842-32f3d3e8fabc?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Green Lentils (1kg)', price: 135, stock: 26, category: 'grains', image: 'https://images.unsplash.com/photo-1624516107151-73aed4f6dbec?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Chickpeas (1kg)', price: 115, stock: 32, category: 'grains', image: 'https://images.unsplash.com/photo-1598170845901-e3a4c73a0b6c?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Black Beans (1kg)', price: 120, stock: 24, category: 'grains', image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Kidney Beans (1kg)', price: 125, stock: 22, category: 'grains', image: 'https://images.unsplash.com/photo-1583906810078-03e9d585a394?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Pinto Beans (1kg)', price: 118, stock: 20, category: 'grains', image: 'https://images.unsplash.com/photo-1570895090062-c95cf8e1ade9?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Black Eyed Peas (1kg)', price: 110, stock: 25, category: 'grains', image: 'https://images.unsplash.com/photo-1600803907087-f56d462fd26b?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Split Peas (1kg)', price: 130, stock: 18, category: 'grains', image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Moong Beans (1kg)', price: 140, stock: 20, category: 'grains', image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Urad Beans (1kg)', price: 145, stock: 18, category: 'grains', image: 'https://images.unsplash.com/photo-1611523224108-bcc3ba96e69a?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Chana Flour (1kg)', price: 85, stock: 35, category: 'grains', image: 'https://images.unsplash.com/photo-1595863426644-abb89d8b9c66?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Multigrain Flour (1kg)', price: 65, stock: 40, category: 'grains', image: 'https://images.unsplash.com/photo-1590778255856-fa2f90409e1e?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Semolina (1kg)', price: 48, stock: 45, category: 'grains', image: 'https://images.unsplash.com/photo-1605096882530-ce07a53de5da?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Bran Flour (1kg)', price: 55, stock: 30, category: 'grains', image: 'https://images.unsplash.com/photo-1576789224849-5022fc7e750e?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                
                // Dairy
                { name: 'Milk (1L)', price: 55, stock: 90, category: 'dairy', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Eggs (6 pack)', price: 65, stock: 70, category: 'dairy', image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Yogurt (500g)', price: 75, stock: 45, category: 'dairy', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Butter (500g)', price: 285, stock: 32, category: 'dairy', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Paneer (200g)', price: 95, stock: 38, category: 'dairy', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Cheese (200g)', price: 145, stock: 28, category: 'dairy', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Milk Powder (400g)', price: 220, stock: 22, category: 'dairy', image: 'https://images.unsplash.com/photo-1606312619070-d48b4a1a6b0e?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Greek Yogurt (200g)', price: 95, stock: 30, category: 'dairy', image: 'https://images.unsplash.com/photo-1571212515416-fca2136c5fa7?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Cottage Cheese (200g)', price: 85, stock: 25, category: 'dairy', image: 'https://images.unsplash.com/photo-1564653999812-b161fa37f6ac?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Condensed Milk (395g)', price: 75, stock: 35, category: 'dairy', image: 'https://images.unsplash.com/photo-1612652551717-4b3e4c1e8d80?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                
                // Oils & Condiments
                { name: 'Sunflower Oil (1L)', price: 150, stock: 30, category: 'oils', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Olive Oil (500ml)', price: 480, stock: 18, category: 'oils', image: 'https://images.unsplash.com/photo-1608181831046-1f79f832eeac?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Ghee (500g)', price: 320, stock: 25, category: 'oils', image: 'https://images.unsplash.com/photo-1596040505149-c7998c523026?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Turmeric Powder (100g)', price: 65, stock: 42, category: 'oils', image: 'https://images.unsplash.com/photo-1615485500134-275813583b6a?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Chili Powder (100g)', price: 55, stock: 48, category: 'oils', image: 'https://images.unsplash.com/photo-1599789205460-47a0d6a6a4f1?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Garam Masala (50g)', price: 85, stock: 35, category: 'oils', image: 'https://images.unsplash.com/photo-1596040033229-a0b5e8fc2ff7?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Coconut Oil (500ml)', price: 195, stock: 28, category: 'oils', image: 'https://images.unsplash.com/photo-1582051570380-a26e3af76359?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Mustard Oil (1L)', price: 165, stock: 22, category: 'oils', image: 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Sesame Oil (250ml)', price: 185, stock: 18, category: 'oils', image: 'https://images.unsplash.com/photo-1610695572441-df06b3ad1a0b?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Canola Oil (1L)', price: 140, stock: 26, category: 'oils', image: 'https://images.unsplash.com/photo-1600450682657-ceef35a60279?auto=format&fit=crop&w=800&q=80', shopId: 'default' }
                ,
                // Branded Cooking Spices (popular Indian brands)
                { name: 'Sakthi Sambar Masala (100g)', price: 55, stock: 120, category: 'oils', image: 'https://images.unsplash.com/photo-1596040033229-a0b5e8fc2ff7?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Aachi Turmeric Powder (100g)', price: 48, stock: 140, category: 'oils', image: 'https://images.unsplash.com/photo-1615485500134-275813583b6a?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Sakthi Garam Masala (50g)', price: 65, stock: 100, category: 'oils', image: 'https://images.unsplash.com/photo-1596040033229-a0b5e8fc2ff7?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Aachi Chilli Powder (100g)', price: 52, stock: 130, category: 'oils', image: 'https://images.unsplash.com/photo-1599789205460-47a0d6a6a4f1?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Sakthi Coriander Powder (100g)', price: 50, stock: 110, category: 'oils', image: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Aachi Curry Masala (100g)', price: 58, stock: 105, category: 'oils', image: 'https://images.unsplash.com/photo-1505253468034-514d2507d914?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Sakthi Kitchen King Masala (50g)', price: 72, stock: 90, category: 'oils', image: 'https://images.unsplash.com/photo-1596040033229-a0b5e8fc2ff7?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Aachi Garam Masala (50g)', price: 68, stock: 95, category: 'oils', image: 'https://images.unsplash.com/photo-1596040033229-a0b5e8fc2ff7?auto=format&fit=crop&w=800&q=80', shopId: 'default' }
                ,
                // Makeup & Shampoo items
                { name: 'Lakme Lipstick (Red)', price: 299, stock: 80, category: 'makeup', image: 'https://images.unsplash.com/photo-1543353071-087092ec393f?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Maybelline Fit Me Foundation (30ml)', price: 499, stock: 60, category: 'makeup', image: 'https://images.unsplash.com/photo-1581609401521-3d3f0f1d6c9a?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Colorbar Kajal', price: 149, stock: 100, category: 'makeup', image: 'https://images.unsplash.com/photo-1556228720-94d2f0c4f3c4?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Lakme Compact (Natural)', price: 350, stock: 70, category: 'makeup', image: 'https://images.unsplash.com/photo-1589561084283-930aa7b1f0d4?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Head & Shoulders Anti-Dandruff Shampoo (180ml)', price: 180, stock: 120, category: 'shampoos', image: 'https://images.unsplash.com/photo-1580281657526-2b8b62a2d1b8?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Dove Intense Repair Shampoo (200ml)', price: 210, stock: 110, category: 'shampoos', image: 'https://images.unsplash.com/photo-1545167622-3d6a6ffb3a9c?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Clinic Plus Strong & Long Shampoo (200ml)', price: 120, stock: 140, category: 'shampoos', image: 'https://images.unsplash.com/photo-1598514983495-c73f5f2f6a3a?auto=format&fit=crop&w=800&q=80', shopId: 'default' }
            ];
            
            // Use bulkWrite with upsert to insert new products and update existing ones
            const bulkOps = defaultProducts.map(product => ({
                updateOne: {
                    filter: { name: product.name, shopId: product.shopId || 'default' },
                    update: { $set: product },
                    upsert: true
                }
            }));
            
            const result = await Product.bulkWrite(bulkOps);
            console.log(`✅ Products synced! Inserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}, Matched: ${result.matchedCount}`);
    } catch (error) {
        console.error('Error seeding products:', error);
    }
}

// Call seed function after DB connection
mongoose.connection.once('open', () => {
    seedProducts();
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stock", stockManagementRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(5000, () => console.log("Server running on port 5000"));
