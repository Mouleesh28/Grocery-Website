const express = require("express");
const Product = require("../config/models/Product");

const router = express.Router();

// Add Product (Wholesale or Shop)
router.post("/add", async (req, res) => {
    try {
        const { name, price, stock, category, image, shopId } = req.body;
        
        // Validation
        if (!name || !price || !stock || !category) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }
        
        const product = new Product({
            name,
            price,
            stock,
            category,
            image,
            shopId
        });
        
        await product.save();
        res.json({ message: "Product added successfully", product });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: "Failed to add product", error: error.message });
    }
});

// Get All Products
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        
        // If database is empty, seed sample products and return stored docs with _id
        if (products.length === 0) {
            const sampleProducts = [
        
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
                { name: 'Blueberries (250g)', price: 165, stock: 20, category: 'fruits', image: 'https://images.unsplash.com/photo-1599599810694-e5f8c1d7b4b5?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Raspberries (200g)', price: 140, stock: 18, category: 'fruits', image: 'https://images.unsplash.com/photo-1599599810964-76f62a08dc49?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Blackberries (200g)', price: 130, stock: 15, category: 'fruits', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Coconut (1pc)', price: 75, stock: 25, category: 'fruits', image: 'https://images.unsplash.com/photo-1609137144813-f2350be90029?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Lime (500g)', price: 40, stock: 50, category: 'fruits', image: 'https://images.unsplash.com/photo-1585466620081-f5129b01bd2f?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Avocado (3pc)', price: 160, stock: 22, category: 'fruits', image: 'https://images.unsplash.com/photo-1523049673857-eb7a9fab033b?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Grapefruit (1kg)', price: 110, stock: 20, category: 'fruits', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Tangerine (1kg)', price: 100, stock: 30, category: 'fruits', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Passion Fruit (250g)', price: 95, stock: 18, category: 'fruits', image: 'https://images.unsplash.com/photo-1600599810694-e5f8c1d7b4b5?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Lychee (500g)', price: 145, stock: 20, category: 'fruits', image: 'https://images.unsplash.com/photo-1599599810964-76f62a08dc49?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Cherries (250g)', price: 175, stock: 15, category: 'fruits', image: 'https://images.unsplash.com/photo-1585466620081-f5129b01bd2f?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Plum (500g)', price: 95, stock: 25, category: 'fruits', image: 'https://images.unsplash.com/photo-1523049673857-eb7a9fab033b?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Apricot (500g)', price: 115, stock: 22, category: 'fruits', image: 'https://images.unsplash.com/photo-1609137144813-f2350be90029?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Date Palm (500g)', price: 185, stock: 18, category: 'fruits', image: 'https://images.unsplash.com/photo-1599599810694-e5f8c1d7b4b5?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Figs (250g)', price: 155, stock: 16, category: 'fruits', image: 'https://images.unsplash.com/photo-1599599810964-76f62a08dc49?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Mulberries (200g)', price: 125, stock: 14, category: 'fruits', image: 'https://images.unsplash.com/photo-1585466620081-f5129b01bd2f?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                
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
                { name: 'Green Beans (500g)', price: 55, stock: 40, category: 'vegetables', image: 'https://images.unsplash.com/photo-1609137144813-f2350be90029?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Zucchini (500g)', price: 45, stock: 35, category: 'vegetables', image: 'https://images.unsplash.com/photo-1599599810694-e5f8c1d7b4b5?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Eggplant (600g)', price: 50, stock: 32, category: 'vegetables', image: 'https://images.unsplash.com/photo-1599599810964-76f62a08dc49?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Peas (500g)', price: 65, stock: 28, category: 'vegetables', image: 'https://images.unsplash.com/photo-1585466620081-f5129b01bd2f?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Corn (4 pieces)', price: 55, stock: 36, category: 'vegetables', image: 'https://images.unsplash.com/photo-1523049673857-eb7a9fab033b?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Radish (500g)', price: 30, stock: 45, category: 'vegetables', image: 'https://images.unsplash.com/photo-1609137144813-f2350be90029?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Turnip (500g)', price: 35, stock: 38, category: 'vegetables', image: 'https://images.unsplash.com/photo-1599599810694-e5f8c1d7b4b5?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Beet (500g)', price: 40, stock: 32, category: 'vegetables', image: 'https://images.unsplash.com/photo-1599599810964-76f62a08dc49?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Lettuce (1 bunch)', price: 35, stock: 50, category: 'vegetables', image: 'https://images.unsplash.com/photo-1585466620081-f5129b01bd2f?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Kale (1 bunch)', price: 45, stock: 28, category: 'vegetables', image: 'https://images.unsplash.com/photo-1523049673857-eb7a9fab033b?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Bok Choy (500g)', price: 40, stock: 35, category: 'vegetables', image: 'https://images.unsplash.com/photo-1609137144813-f2350be90029?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Celery (1 bunch)', price: 38, stock: 42, category: 'vegetables', image: 'https://images.unsplash.com/photo-1599599810694-e5f8c1d7b4b5?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Okra (500g)', price: 45, stock: 30, category: 'vegetables', image: 'https://images.unsplash.com/photo-1599599810964-76f62a08dc49?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Asparagus (300g)', price: 75, stock: 22, category: 'vegetables', image: 'https://images.unsplash.com/photo-1585466620081-f5129b01bd2f?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Brussels Sprouts (500g)', price: 60, stock: 25, category: 'vegetables', image: 'https://images.unsplash.com/photo-1523049673857-eb7a9fab033b?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Chili Peppers (250g)', price: 65, stock: 28, category: 'vegetables', image: 'https://images.unsplash.com/photo-1609137144813-f2350be90029?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Garlic (250g)', price: 55, stock: 50, category: 'vegetables', image: 'https://images.unsplash.com/photo-1599599810694-e5f8c1d7b4b5?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Ginger (250g)', price: 60, stock: 45, category: 'vegetables', image: 'https://images.unsplash.com/photo-1599599810964-76f62a08dc49?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Coriander Leaves (1 bunch)', price: 20, stock: 60, category: 'vegetables', image: 'https://images.unsplash.com/photo-1585466620081-f5129b01bd2f?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Mint Leaves (1 bunch)', price: 22, stock: 58, category: 'vegetables', image: 'https://images.unsplash.com/photo-1523049673857-eb7a9fab033b?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                { name: 'Parsley (1 bunch)', price: 25, stock: 50, category: 'vegetables', image: 'https://images.unsplash.com/photo-1609137144813-f2350be90029?auto=format&fit=crop&w=800&q=80', shopId: 'default' },
                
                
                
                
                // Grains & Bread
                { name: 'Whole Wheat Bread', price: 45, stock: 25, category: 'grains', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
                { name: 'Basmati Rice (5kg)', price: 520, stock: 20, category: 'grains', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80' },
                { name: 'Wheat Flour (1kg)', price: 45, stock: 75, category: 'grains', image: 'https://images.unsplash.com/photo-1628502840903-8a11f2f83b04?auto=format&fit=crop&w=800&q=80' },
                { name: 'Pasta (500g)', price: 85, stock: 40, category: 'grains', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80' },
                { name: 'Oats (1kg)', price: 180, stock: 35, category: 'grains', image: 'https://images.unsplash.com/photo-1590432593976-e4e19b5a3fb3?auto=format&fit=crop&w=800&q=80' },
                { name: 'Popcorn Kernels (500g)', price: 65, stock: 28, category: 'grains', image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=800&q=80' },
                
                // Dairy
                { name: 'Milk (1L)', price: 55, stock: 90, category: 'dairy', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80' },
                { name: 'Eggs (6 pack)', price: 65, stock: 70, category: 'dairy', image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=800&q=80' },
                { name: 'Yogurt (500g)', price: 75, stock: 45, category: 'dairy', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80' },
                { name: 'Butter (500g)', price: 285, stock: 32, category: 'dairy', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=800&q=80' },
                { name: 'Paneer (200g)', price: 95, stock: 38, category: 'dairy', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80' },
                
                // Oils & Spices
                { name: 'Sunflower Oil (1L)', price: 150, stock: 30, category: 'oils', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80' },
                { name: 'Olive Oil (500ml)', price: 480, stock: 18, category: 'oils', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80' },
                { name: 'Ghee (500g)', price: 320, stock: 25, category: 'oils', image: 'https://images.unsplash.com/photo-1596040505149-c7998c523026?auto=format&fit=crop&w=800&q=80' },
                { name: 'Turmeric Powder (100g)', price: 65, stock: 42, category: 'oils', image: 'https://images.unsplash.com/photo-1615485500134-275813583b6a?auto=format&fit=crop&w=800&q=80' },
                { name: 'Chili Powder (100g)', price: 55, stock: 48, category: 'oils', image: 'https://images.unsplash.com/photo-1599789205460-47a0d6a6a4f1?auto=format&fit=crop&w=800&q=80' },
                { name: 'Garam Masala (50g)', price: 85, stock: 35, category: 'oils', image: 'https://images.unsplash.com/photo-1596040033229-a0b5e8fc2ff7?auto=format&fit=crop&w=800&q=80' }
                ,
                // Makeup
                { name: 'Lakme Lipstick (Red)', price: 299, stock: 80, category: 'makeup', image: 'https://images.unsplash.com/photo-1543353071-087092ec393f?auto=format&fit=crop&w=800&q=80' },
                { name: 'Maybelline Fit Me Foundation (30ml)', price: 499, stock: 60, category: 'makeup', image: 'https://images.unsplash.com/photo-1581609401521-3d3f0f1d6c9a?auto=format&fit=crop&w=800&q=80' },
                { name: 'Colorbar Kajal', price: 149, stock: 100, category: 'makeup', image: 'https://images.unsplash.com/photo-1556228720-94d2f0c4f3c4?auto=format&fit=crop&w=800&q=80' },
                // Shampoos
                { name: 'Head & Shoulders Anti-Dandruff Shampoo (180ml)', price: 180, stock: 120, category: 'shampoos', image: 'https://images.unsplash.com/photo-1580281657526-2b8b62a2d1b8?auto=format&fit=crop&w=800&q=80' },
                { name: 'Dove Intense Repair Shampoo (200ml)', price: 210, stock: 110, category: 'shampoos', image: 'https://images.unsplash.com/photo-1545167622-3d6a6ffb3a9c?auto=format&fit=crop&w=800&q=80' },
                { name: 'Clinic Plus Strong & Long Shampoo (200ml)', price: 120, stock: 140, category: 'shampoos', image: 'https://images.unsplash.com/photo-1598514983495-c73f5f2f6a3a?auto=format&fit=crop&w=800&q=80' }
            ];
            const seededProducts = await Product.insertMany(sampleProducts);
            return res.json(seededProducts);
        }
        
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: "Failed to fetch products", error: error.message });
    }
});

// Update Product Price (Admin)
router.put("/:id/price", async (req, res) => {
    try {
        const { id } = req.params;
        const { price } = req.body;

        const nextPrice = Number(price);
        if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
            return res.status(400).json({ message: "Valid price is required" });
        }

        const product = await Product.findByIdAndUpdate(
            id,
            { price: nextPrice },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Price updated", product });
    } catch (error) {
        console.error('Error updating price:', error);
        res.status(500).json({ message: "Failed to update price", error: error.message });
    }
});

// Update Product Details (Admin)
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, stock, image } = req.body;

        const nextName = typeof name === "string" ? name.trim() : "";
        const nextPrice = Number(price);
        const nextStock = Number(stock);

        if (!nextName) {
            return res.status(400).json({ message: "Product name is required" });
        }

        if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
            return res.status(400).json({ message: "Valid price is required" });
        }

        if (!Number.isFinite(nextStock) || nextStock < 0 || !Number.isInteger(nextStock)) {
            return res.status(400).json({ message: "Valid stock is required" });
        }

        const updates = {
            name: nextName,
            price: nextPrice,
            stock: nextStock
        };

        if (typeof image === "string") {
            updates.image = image.trim();
        }

        const product = await Product.findByIdAndUpdate(id, updates, { new: true });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product updated", product });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Failed to update product", error: error.message });
    }
});

// Add to Cart - Reduce Stock
router.post("/add-to-cart", async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        if (!productId || !quantity) {
            return res.status(400).json({ message: "Product ID and quantity are required" });
        }
        
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        if (product.stock < quantity) {
            return res.status(400).json({ 
                message: "Insufficient stock", 
                availableStock: product.stock 
            });
        }
        
        // Reduce stock
        product.stock -= quantity;
        await product.save();
        
        res.json({ 
            message: "Item added to cart successfully", 
            product,
            remainingStock: product.stock 
        });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: "Failed to add item to cart", error: error.message });
    }
});

module.exports = router;