const API_URL = 'http://localhost:5000/api';
let token = localStorage.getItem('token');
let userRole_var = localStorage.getItem('role');
let cart = [];
let currentLang = localStorage.getItem('lang') || 'en';
let currentCategory = 'all';
let currentSearchTerm = '';
let allProductsCache = [];
let editingProductId = null;

const translations = {
    en: {
        navHome: 'Home',
        navProducts: 'Products',
        navOrders: 'Orders',
        heroTitle: 'Welcome to Gayathiri Grocery Mart',
        heroSubtitle: 'Fresh groceries delivered to your doorstep in minutes',
        featFast: 'Fast Delivery',
        featFresh: 'Fresh Products',
        featSecure: 'Secure Payment',
        heroCTA: 'Browse Now',
        tabLogin: 'Login',
        tabRegister: 'Register',
        loginTitle: 'Login to Your Account',
        loginEmailPh: 'Email address',
        loginPassPh: 'Password',
        loginBtn: 'Login',
        registerTitle: 'Create Account',
        regNamePh: 'Full name',
        regEmailPh: 'Email address',
        regPassPh: 'Password',
        roleCustomer: '👤 Customer',
        roleShop: '🏪 Shop Owner',
        roleWholesale: '🏢 Wholesale',
        roleAdmin: '🛡️ Admin',
        registerBtn: 'Register',
        productsTitle: 'Products',
        productsSubtitle: 'Browse our fresh collection',
        productSearchPh: 'Search products...',
        clearSearch: 'Clear',
        editPrice: 'Edit Price',
        pricePrompt: 'Enter new price (current: ₹{price})',
        addProductBtn: 'Add Product',
        addProductTitle: 'Add New Product',
        productNamePh: 'Product Name',
        productImagePh: 'Image URL (optional)',
        productPricePh: 'Price (₹)',
        productStockPh: 'Stock',
        saveProduct: 'Add Product',
        cancelBtn: 'Cancel',
        ordersTitle: 'Your Orders',
        ordersSubtitle: 'Track your delivery status',
        cartTitle: 'Your Cart',
        cartTotalLabel: 'Total:',
        payCOD: '💵 Cash on Delivery',
        payOnline: '💳 Online Payment',
        payGPay: '🟢 Google Pay (GPay)',
        payPhonePe: '🔵 PhonePe',
        payPaytm: '🔷 Paytm',
        placeOrderBtn: 'Place Order',
        loginSuccess: 'Login successful!',
        loginFail: 'Login failed!',
        loginUserNotFound: 'User not found',
        loginWrongPass: 'Incorrect password',
        regSuccess: 'Registration successful! Please login.',
        regFail: 'Registration failed!',
        cartEmpty: 'Your cart is empty',
        addToCartAlert: 'added to cart!',
        orderFail: 'Failed to place order!',
        productAddFail: 'Failed to add product!',
        noOrders: 'No orders found',
        freshTag: 'Fresh',
        orderSuccess: 'Order placed successfully!',
        aiAssistant: '🤖 AI Assistant',
        aiGreeting: 'Hello! How can I help you?',
        aiAskProduct: 'Looking for a product?',
        aiRecommend: 'Top Recommendations',
        aiSendMsg: 'Send Message',
        aiClose: 'Close',
        buyNow: 'Buy Now',
    },
    hi: {
        navHome: 'होम',
        navProducts: 'उत्पाद',
        navOrders: 'ऑर्डर',
        heroTitle: 'Gayathiri Grocery Mart में आपका स्वागत है',
        heroSubtitle: 'ताज़ा किराना मिनटों में आपके दरवाजे पर',
        featFast: 'तेज़ डिलीवरी',
        featFresh: 'ताज़ा उत्पाद',
        featSecure: 'सुरक्षित भुगतान',
        heroCTA: 'अभी देखें',
        tabLogin: 'लॉगिन',
        tabRegister: 'रजिस्टर',
        loginTitle: 'अपने खाते में लॉगिन करें',
        loginEmailPh: 'ईमेल पता',
        loginPassPh: 'पासवर्ड',
        loginBtn: 'लॉगिन',
        registerTitle: 'खाता बनाएं',
        regNamePh: 'पूरा नाम',
        regEmailPh: 'ईमेल पता',
        regPassPh: 'पासवर्ड',
        roleCustomer: '👤 ग्राहक',
        roleShop: '🏪 दुकान मालिक',
        roleWholesale: '🏢 होलसेल',
        roleAdmin: '🛡️ एडमिन',
        registerBtn: 'रजिस्टर',
        productsTitle: 'उत्पाद',
        productsSubtitle: 'हमारा ताज़ा संग्रह देखें',
        productSearchPh: 'उत्पाद खोजें...',
        clearSearch: 'हटाएं',
        editPrice: 'कीमत बदलें',
        pricePrompt: 'नई कीमत दर्ज करें (मौजूदा: ₹{price})',
        addProductBtn: 'उत्पाद जोड़ें',
        addProductTitle: 'नया उत्पाद जोड़ें',
        productNamePh: 'उत्पाद का नाम',
        productImagePh: 'चित्र लिंक (वैकल्पिक)',
        productPricePh: 'कीमत (₹)',
        productStockPh: 'स्टॉक',
        saveProduct: 'उत्पाद जोड़ें',
        cancelBtn: 'रद्द करें',
        ordersTitle: 'आपके ऑर्डर',
        ordersSubtitle: 'डिलीवरी स्थिति ट्रैक करें',
        cartTitle: 'आपकी कार्ट',
        cartTotalLabel: 'कुल:',
        payCOD: '💵 कैश ऑन डिलीवरी',
        payOnline: '💳 ऑनलाइन भुगतान',
        payGPay: '🟢 गूगल पे (GPay)',
        payPhonePe: '🔵 फोनपे',
        payPaytm: '🔷 पेटीएम',
        placeOrderBtn: 'ऑर्डर करें',
        loginSuccess: 'लॉगिन सफल!',
        loginFail: 'लॉगिन विफल!',
        loginUserNotFound: 'यूज़र नहीं मिला',
        loginWrongPass: 'गलत पासवर्ड',
        regSuccess: 'रजिस्ट्रेशन सफल! कृपया लॉगिन करें।',
        regFail: 'रजिस्ट्रेशन विफल!',
        cartEmpty: 'आपकी कार्ट खाली है',
        addToCartAlert: 'कार्ट में जोड़ा गया!',
        orderFail: 'ऑर्डर करने में विफल!',
        productAddFail: 'उत्पाद जोड़ने में विफल!',
        noOrders: 'कोई ऑर्डर नहीं मिला',
        freshTag: 'ताज़ा',
        orderSuccess: 'ऑर्डर सफलतापूर्वक किया गया!',
        aiAssistant: '🤖 AI सहायक',
        aiGreeting: 'नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?',
        aiAskProduct: 'कोई उत्पाद खोज रहे हैं?',
        aiRecommend: 'सर्वश्रेष्ठ सुझाव',
        aiSendMsg: 'संदेश भेजें',
        aiClose: 'बंद करें',
        buyNow: 'अभी खरीदें',
    },
    ta: {
        navHome: 'முகப்பு',
        navProducts: 'பொருட்கள்',
        navOrders: 'ஆர்டர்கள்',
        heroTitle: 'Gayathiri Grocery Mart-க்கு வரவேற்பு',
        heroSubtitle: 'புதிய மளிகைப் பொருட்கள் சில நிமிடங்களில் உங்களிடம்',
        featFast: 'வேகமான டெலிவரி',
        featFresh: 'புதிய பொருட்கள்',
        featSecure: 'பாதுகாப்பான கட்டணம்',
        heroCTA: 'இப்போது பாருங்கள்',
        tabLogin: 'உள்நுழை',
        tabRegister: 'பதிவு',
        loginTitle: 'உங்கள் கணக்கில் உள்நுழைக',
        loginEmailPh: 'மின்னஞ்சல் முகவரி',
        loginPassPh: 'கடவுச்சொல்',
        loginBtn: 'உள்நுழை',
        registerTitle: 'கணக்கு உருவாக்கு',
        regNamePh: 'முழு பெயர்',
        regEmailPh: 'மின்னஞ்சல் முகவரி',
        regPassPh: 'கடவுச்சொல்',
        roleCustomer: '👤 வாடிக்கையாளர்',
        roleShop: '🏪 கடை உரிமையாளர்',
        roleWholesale: '🏢 மொத்த விற்பனை',
        roleAdmin: '🛡️ நிர்வாகி',
        registerBtn: 'பதிவு',
        productsTitle: 'பொருட்கள்',
        productsSubtitle: 'எங்கள் புதிய சேகரிப்பைக் காண்க',
        productSearchPh: 'பொருட்கள் தேடுங்கள்...',
        clearSearch: 'நீக்கு',
        editPrice: 'விலை மாற்று',
        pricePrompt: 'புதிய விலையை உள்ளிடவும் (தற்போது: ₹{price})',
        addProductBtn: 'பொருள் சேர்க்க',
        addProductTitle: 'புதிய பொருள் சேர்க்க',
        productNamePh: 'பொருளின் பெயர்',
        productImagePh: 'பட இணைப்பு (விருப்பம்)',
        productPricePh: 'விலை (₹)',
        productStockPh: 'சரக்கு',
        saveProduct: 'பொருள் சேர்க்க',
        cancelBtn: 'ரத்து',
        ordersTitle: 'உங்கள் ஆர்டர்கள்',
        ordersSubtitle: 'டெலிவரி நிலையைப் பின்தொடர்க',
        cartTitle: 'உங்கள் வண்டி',
        cartTotalLabel: 'மொத்தம்:',
        payCOD: '💵 காசோலை / COD',
        payOnline: '💳 ஆன்லைன் கட்டணம்',
        payGPay: '🟢 கூகுள் பே (GPay)',
        payPhonePe: '🔵 போன்பே',
        payPaytm: '🔷 பேடிஎம்',
        placeOrderBtn: 'ஆர்டர் இடு',
        loginSuccess: 'உள்நுழைவு வெற்றி!',
        loginFail: 'உள்நுழைவு தோல்வி!',
        loginUserNotFound: 'பயனர் இல்லை',
        loginWrongPass: 'தவறான கடவுச்சொல்',
        regSuccess: 'பதிவு நிறைவு! தயவு செய்து உள்நுழைக.',
        regFail: 'பதிவு தோல்வி!',
        cartEmpty: 'உங்கள் வண்டி காலியாக உள்ளது',
        addToCartAlert: 'வண்டியில் சேர்க்கப்பட்டது!',
        orderFail: 'ஆர்டர் தோல்வி!',
        productAddFail: 'பொருள் சேர்க்க முடியவில்லை!',
        noOrders: 'ஆர்டர்கள் எதுவும் இல்லை',
        freshTag: 'புதியது',
        orderSuccess: 'ஆர்டர் வெற்றிகரமாக நிறைவேறியது!',
        aiAssistant: '🤖 AI உதவியாளர்',
        aiGreeting: 'வணக்கம்! நான் உங்களுக்கு எப்படி உதவ முடியும்?',
        aiAskProduct: 'பொருள் தேடுகிறீர்கள்?',
        aiRecommend: 'சிறந்த பரிந்துரை',
        aiSendMsg: 'செய்தி அனுப்பு',
        aiClose: 'மூடு',
        buyNow: 'இப்போது வாங்க',
    }
};

function t(key) {
    return (translations[currentLang] && translations[currentLang][key]) || translations.en[key] || key;
}

function applyTranslations() {
    const textNodes = document.querySelectorAll('[data-i18n]');
    textNodes.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const icon = el.querySelector('i');
        const txt = t(key);
        if (icon) {
            el.innerHTML = `${icon.outerHTML} ${txt}`;
        } else {
            el.textContent = txt;
        }
    });

    const placeholderNodes = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderNodes.forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });

    const langSelect = document.getElementById('langSelect');
    if (langSelect) langSelect.value = currentLang;
}

// Sample grocery items used when API has no data
const sampleProducts = [
    // Fruits (15 items)
    { name: 'Fresh Apples (1kg)', price: 120, stock: 40, category: 'fruits', image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=800&q=80' },
    { name: 'Bananas (1 Dozen)', price: 60, stock: 50, category: 'fruits', image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=800&q=80' },
    { name: 'Oranges (1kg)', price: 90, stock: 35, category: 'fruits', image: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?auto=format&fit=crop&w=800&q=80' },
    { name: 'Grapes (500g)', price: 85, stock: 45, category: 'fruits', image: 'https://images.unsplash.com/photo-1599819177326-f537d2fae1c9?auto=format&fit=crop&w=800&q=80' },
    { name: 'Mango (1kg)', price: 150, stock: 30, category: 'fruits', image: 'https://images.unsplash.com/photo-1605635619311-762e6e82e7d9?auto=format&fit=crop&w=800&q=80' },
    { name: 'Strawberries (250g)', price: 110, stock: 25, category: 'fruits', image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=800&q=80' },
    { name: 'Watermelon (1pc)', price: 200, stock: 20, category: 'fruits', image: 'https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?auto=format&fit=crop&w=800&q=80' },
    { name: 'Pomegranate (1kg)', price: 130, stock: 28, category: 'fruits', image: 'https://images.unsplash.com/photo-1547516060-e2ff0c5daa3f?auto=format&fit=crop&w=800&q=80' },
    { name: 'Pineapple (1pc)', price: 95, stock: 22, category: 'fruits', image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80' },
    { name: 'Kiwi (6pc)', price: 140, stock: 18, category: 'fruits', image: 'https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?auto=format&fit=crop&w=800&q=80' },
    { name: 'Papaya (1kg)', price: 75, stock: 32, category: 'fruits', image: 'https://images.unsplash.com/photo-1603052378066-5b43c2f6e4e6?auto=format&fit=crop&w=800&q=80' },
    { name: 'Dragon Fruit (1pc)', price: 180, stock: 15, category: 'fruits', image: 'https://images.unsplash.com/photo-1527325678964-54921661f888?auto=format&fit=crop&w=800&q=80' },
    { name: 'Guava (500g)', price: 65, stock: 38, category: 'fruits', image: 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?auto=format&fit=crop&w=800&q=80' },
    { name: 'Peach (500g)', price: 125, stock: 24, category: 'fruits', image: 'https://images.unsplash.com/photo-1629828874514-944937187fe7?auto=format&fit=crop&w=800&q=80' },
    { name: 'Lemon (250g)', price: 35, stock: 55, category: 'fruits', image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=800&q=80' },
    
    // Vegetables (10 items)
    { name: 'Tomatoes (1kg)', price: 45, stock: 80, category: 'vegetables', image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=800&q=80' },
    { name: 'Onions (1kg)', price: 35, stock: 100, category: 'vegetables', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80' },
    { name: 'Potatoes (1kg)', price: 30, stock: 120, category: 'vegetables', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80' },
    { name: 'Broccoli (500g)', price: 55, stock: 35, category: 'vegetables', image: 'https://images.unsplash.com/photo-1584270354949-c26c2d6d8a7c?auto=format&fit=crop&w=800&q=80' },
    { name: 'Spinach (1 bunch)', price: 25, stock: 60, category: 'vegetables', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80' },
    { name: 'Carrots (1kg)', price: 40, stock: 95, category: 'vegetables', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80' },
    { name: 'Cauliflower (1pc)', price: 48, stock: 42, category: 'vegetables', image: 'https://images.unsplash.com/photo-1568584711271-61b82ce868d3?auto=format&fit=crop&w=800&q=80' },
    { name: 'Cabbage (1pc)', price: 35, stock: 50, category: 'vegetables', image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=800&q=80' },
    { name: 'Bell Pepper (500g)', price: 70, stock: 38, category: 'vegetables', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80' },
    { name: 'Cucumber (500g)', price: 28, stock: 65, category: 'vegetables', image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=800&q=80' },
    
    // Grains & Bread (6 items)
    { name: 'Whole Wheat Bread', price: 45, stock: 25, category: 'grains', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
    { name: 'Basmati Rice (5kg)', price: 520, stock: 20, category: 'grains', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80' },
    { name: 'Wheat Flour (1kg)', price: 45, stock: 75, category: 'grains', image: 'https://images.unsplash.com/photo-1628502840903-8a11f2f83b04?auto=format&fit=crop&w=800&q=80' },
    { name: 'Pasta (500g)', price: 85, stock: 40, category: 'grains', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80' },
    { name: 'Oats (1kg)', price: 180, stock: 35, category: 'grains', image: 'https://images.unsplash.com/photo-1590432593976-e4e19b5a3fb3?auto=format&fit=crop&w=800&q=80' },
    { name: 'Popcorn Kernels (500g)', price: 65, stock: 28, category: 'grains', image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=800&q=80' },
    
    // Dairy (5 items)
    { name: 'Milk (1L)', price: 55, stock: 90, category: 'dairy', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80' },
    { name: 'Eggs (6 pack)', price: 65, stock: 70, category: 'dairy', image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=800&q=80' },
    { name: 'Yogurt (500g)', price: 75, stock: 45, category: 'dairy', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80' },
    { name: 'Butter (500g)', price: 285, stock: 32, category: 'dairy', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=800&q=80' },
    { name: 'Paneer (200g)', price: 95, stock: 38, category: 'dairy', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80' },
    
    // Oils & Spices (6 items)
    { name: 'Sunflower Oil (1L)', price: 150, stock: 30, category: 'oils', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80' },
    { name: 'Olive Oil (500ml)', price: 480, stock: 18, category: 'oils', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80' },
    { name: 'Ghee (500g)', price: 320, stock: 25, category: 'oils', image: 'https://images.unsplash.com/photo-1596040505149-c7998c523026?auto=format&fit=crop&w=800&q=80' },
    { name: 'Turmeric Powder (100g)', price: 65, stock: 42, category: 'oils', image: 'https://images.unsplash.com/photo-1615485500134-275813583b6a?auto=format&fit=crop&w=800&q=80' },
    { name: 'Chili Powder (100g)', price: 55, stock: 48, category: 'oils', image: 'https://images.unsplash.com/photo-1599789205460-47a0d6a6a4f1?auto=format&fit=crop&w=800&q=80' },
    { name: 'Garam Masala (50g)', price: 85, stock: 35, category: 'oils', image: 'https://images.unsplash.com/photo-1596040033229-a0b5e8fc2ff7?auto=format&fit=crop&w=800&q=80' },
    
    // Makeup (8 items)
    { name: 'Lipstick (24 shades)', price: 250, stock: 45, category: 'makeup', image: 'https://images.unsplash.com/photo-1599599810694-e5f8c1d7b4b5?auto=format&fit=crop&w=800&q=80' },
    { name: 'Foundation (ml)', price: 450, stock: 35, category: 'makeup', image: 'https://images.unsplash.com/photo-1599599810964-76f62a08dc49?auto=format&fit=crop&w=800&q=80' },
    { name: 'Eye Shadow Palette', price: 350, stock: 28, category: 'makeup', image: 'https://images.unsplash.com/photo-1585466620081-f5129b01bd2f?auto=format&fit=crop&w=800&q=80' },
    { name: 'Mascara', price: 280, stock: 42, category: 'makeup', image: 'https://images.unsplash.com/photo-1523049673857-eb7a9fab033b?auto=format&fit=crop&w=800&q=80' },
    { name: 'Blush Powder', price: 320, stock: 38, category: 'makeup', image: 'https://images.unsplash.com/photo-1609137144813-f2350be90029?auto=format&fit=crop&w=800&q=80' },
    { name: 'Concealer', price: 380, stock: 32, category: 'makeup', image: 'https://images.unsplash.com/photo-1599599810694-e5f8c1d7b4b5?auto=format&fit=crop&w=800&q=80' },
    { name: 'Eyeliner', price: 200, stock: 50, category: 'makeup', image: 'https://images.unsplash.com/photo-1599599810964-76f62a08dc49?auto=format&fit=crop&w=800&q=80' },
    { name: 'Face Primer', price: 400, stock: 25, category: 'makeup', image: 'https://images.unsplash.com/photo-1585466620081-f5129b01bd2f?auto=format&fit=crop&w=800&q=80' },
    
    // Shampoos (8 items)
    { name: 'Anti-Dandruff Shampoo (250ml)', price: 220, stock: 60, category: 'shampoos', image: 'https://images.unsplash.com/photo-1523049673857-eb7a9fab033b?auto=format&fit=crop&w=800&q=80' },
    { name: 'Hair Growth Shampoo (200ml)', price: 300, stock: 48, category: 'shampoos', image: 'https://images.unsplash.com/photo-1609137144813-f2350be90029?auto=format&fit=crop&w=800&q=80' },
    { name: 'Volumizing Shampoo (300ml)', price: 250, stock: 55, category: 'shampoos', image: 'https://images.unsplash.com/photo-1599599810694-e5f8c1d7b4b5?auto=format&fit=crop&w=800&q=80' },
    { name: 'Moisturizing Shampoo (250ml)', price: 230, stock: 52, category: 'shampoos', image: 'https://images.unsplash.com/photo-1599599810964-76f62a08dc49?auto=format&fit=crop&w=800&q=80' },
    { name: 'Color Protection Shampoo (200ml)', price: 320, stock: 40, category: 'shampoos', image: 'https://images.unsplash.com/photo-1585466620081-f5129b01bd2f?auto=format&fit=crop&w=800&q=80' },
    { name: 'Organic Herbal Shampoo (250ml)', price: 280, stock: 45, category: 'shampoos', image: 'https://images.unsplash.com/photo-1523049673857-eb7a9fab033b?auto=format&fit=crop&w=800&q=80' },
    { name: 'Sulfate-Free Shampoo (300ml)', price: 340, stock: 35, category: 'shampoos', image: 'https://images.unsplash.com/photo-1609137144813-f2350be90029?auto=format&fit=crop&w=800&q=80' },
    { name: 'Baby Shampoo (200ml)', price: 180, stock: 70, category: 'shampoos', image: 'https://images.unsplash.com/photo-1599599810694-e5f8c1d7b4b5?auto=format&fit=crop&w=800&q=80' }
];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        langSelect.value = currentLang;
        langSelect.addEventListener('change', (e) => {
            currentLang = e.target.value;
            localStorage.setItem('lang', currentLang);
            applyTranslations();
        });
    }

    applyTranslations();

    const searchInput = document.getElementById('productSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentSearchTerm = searchInput.value.trim().toLowerCase();
            if (allProductsCache.length > 0) {
                renderProducts(allProductsCache);
            } else {
                loadProducts();
            }
        });
    }

    if (token) {
        syncUserRoleFromProfile();
    } else {
        updateAuthUI();
    }
    
    // Always load products (for both logged in and not logged in)
    loadProducts();
    
    showPage('home');
});

async function syncUserRoleFromProfile() {
    try {
        const res = await fetch(`${API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const user = await res.json();
            if (user && user.role) {
                userRole_var = user.role;
                localStorage.setItem('role', user.role);
            }
        }
    } catch (error) {
        console.error('Failed to sync user role:', error);
    } finally {
        updateAuthUI();
    }
}

// Page Navigation
function showPage(pageName) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById(`${pageName}Page`);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Load data based on page
    if (pageName === 'products') {
        loadProducts();
    } else if (pageName === 'orders' && token) {
        loadOrders();
    } else if (pageName === 'shopDash' && (userRole_var === 'shop' || userRole_var === 'wholesale' || userRole_var === 'admin')) {
        loadShopOrders();
    }
}

// Auth Tab Switching
function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        tabs[0].classList.add('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        tabs[1].classList.add('active');
    }
}

// Validate password strength
function validatePasswordStrength(password) {
    const hasMinLength = password.length >= 6;
    const hasSpecialChar = /[!@#$%^&*\-_=+]/.test(password);
    return { isStrong: hasMinLength && hasSpecialChar, hasMinLength, hasSpecialChar };
}

function togglePasswordVisibility(inputId, toggleButton) {
    const input = document.getElementById(inputId);
    const icon = toggleButton?.querySelector('i');

    if (!input || !icon) {
        return;
    }

    const isPasswordHidden = input.type === 'password';
    input.type = isPasswordHidden ? 'text' : 'password';
    icon.classList.toggle('fa-eye', !isPasswordHidden);
    icon.classList.toggle('fa-eye-slash', isPasswordHidden);
}

async function register() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const phone = document.getElementById('regPhone').value.trim();
    const selectedRole = document.getElementById('registerRole')?.value || 'customer';
    const isAdminRegister = selectedRole === 'admin';

    if (!name || !email || !password || (!isAdminRegister && !phone)) {
        document.getElementById('regMessage').textContent = 'Please fill all fields';
        document.getElementById('regMessage').style.color = 'red';
        return;
    }

    // Validate password strength
    const pwdCheck = validatePasswordStrength(password);
    if (!pwdCheck.isStrong) {
        let weakMsg = 'This is a weak password. ';
        if (!pwdCheck.hasMinLength) weakMsg += 'Password must be at least 6 characters. ';
        if (!pwdCheck.hasSpecialChar) weakMsg += 'Password must contain a special character (!@#$%^&*-_=+). ';
        weakMsg += 'Use a strong password with 6+ characters and at least one special character.';
        
        document.getElementById('regMessage').textContent = weakMsg;
        document.getElementById('regMessage').style.color = 'red';
        return;
    }

    try {
        const registerEndpoint = isAdminRegister ? `${API_URL}/auth/admin/register` : `${API_URL}/auth/register`;
        const registerPayload = isAdminRegister
            ? { name, email, password }
            : { name, email, password, phone };

        const response = await fetch(registerEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerPayload)
        });

        const data = await response.json();
        if (!response.ok) {
            document.getElementById('regMessage').textContent = data.error || t('regFail');
            document.getElementById('regMessage').style.color = 'red';
            return;
        }

        // Some backend builds may return only a success message on register.
        // If token is missing, do a login request automatically.
        let nextToken = data.token;
        let nextRole = data.role || 'customer';

        if (!nextToken) {
            const loginEndpoint = isAdminRegister ? `${API_URL}/auth/admin/login` : `${API_URL}/auth/login`;
            const loginResponse = await fetch(loginEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const loginData = await loginResponse.json();
            if (!loginResponse.ok || !loginData.token) {
                document.getElementById('regMessage').textContent = data.message || t('regSuccess');
                document.getElementById('regMessage').style.color = 'green';
                return;
            }

            nextToken = loginData.token;
            nextRole = loginData.role || 'customer';
        }

        token = nextToken;
        userRole_var = nextRole;
        localStorage.setItem('token', token);
        localStorage.setItem('role', userRole_var);

        document.getElementById('regMessage').textContent = data.message || t('regSuccess');
        document.getElementById('regMessage').style.color = 'green';

        updateAuthUI();
        setTimeout(() => showPage('products'), 800);
    } catch (error) {
        document.getElementById('regMessage').textContent = t('regFail');
        document.getElementById('regMessage').style.color = 'red';
    }
}

// Login
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const selectedRole = document.getElementById('loginRole')?.value || 'customer';
    const isAdminLogin = selectedRole === 'admin';

    try {
        const loginEndpoint = isAdminLogin ? `${API_URL}/auth/admin/login` : `${API_URL}/auth/login`;
        const response = await fetch(loginEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (response.ok && data.token) {
            token = data.token;
            userRole_var = data.role;
            localStorage.setItem('token', token);
            localStorage.setItem('role', userRole_var);

            if (userRole_var === 'admin') {
                localStorage.setItem('adminToken', token);
                localStorage.setItem('adminRole', userRole_var);
            }
            
            document.getElementById('loginMessage').textContent = t('loginSuccess');
            document.getElementById('loginMessage').style.color = 'green';
            
            updateAuthUI();
            setTimeout(() => {
                if (userRole_var === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    showPage('products');
                }
            }, 1000);
        } else {
            document.getElementById('loginMessage').textContent = data.error || t('loginFail');
            document.getElementById('loginMessage').style.color = 'red';
        }
    } catch (error) {
        document.getElementById('loginMessage').textContent = t('loginFail');
        document.getElementById('loginMessage').style.color = 'red';
    }
}

function logout() {
    token = null;
    userRole_var = null;
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    cart = [];
    updateCartUI();
    updateAuthUI();
    showPage('home');
}

// Customer Modal
function openCustomerModal() {
    if (!token) {
        showPage('login');
        return;
    }
    const modal = document.getElementById('customerModal');
    if (modal) {
        modal.classList.add('active');
        loadCustomerInfo();
    }
}

function closeCustomerModal() {
    const modal = document.getElementById('customerModal');
    if (modal) modal.classList.remove('active');
}

async function loadCustomerInfo() {
    const nameEl = document.getElementById('custName');
    const emailEl = document.getElementById('custEmail');
    const roleEl = document.getElementById('custRole');
    const createdEl = document.getElementById('custCreated');

    // Reset to loading state each time modal opens
    if (nameEl) nameEl.textContent = 'Loading...';
    if (emailEl) emailEl.textContent = 'Loading...';
    if (roleEl) roleEl.textContent = 'Loading...';
    if (createdEl) createdEl.textContent = 'Loading...';

    try {
        const res = await fetch(`${API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
            console.error('Profile fetch failed with status', res.status);
            if (nameEl) nameEl.textContent = 'N/A';
            if (emailEl) emailEl.textContent = 'N/A';
            if (roleEl) roleEl.textContent = 'N/A';
            if (createdEl) createdEl.textContent = 'N/A';
            return;
        }
        const user = await res.json();
        console.log('Customer modal user:', user);
        if (nameEl) nameEl.textContent = user.name || 'N/A';
        if (emailEl) emailEl.textContent = user.email || 'N/A';
        if (roleEl) roleEl.textContent = (user.role || 'customer').toUpperCase();
        const created = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
        if (createdEl) createdEl.textContent = created;
    } catch (e) {
        console.error('Failed to load customer info:', e);
        if (nameEl) nameEl.textContent = 'N/A';
        if (emailEl) emailEl.textContent = 'N/A';
        if (roleEl) roleEl.textContent = 'N/A';
        if (createdEl) createdEl.textContent = 'N/A';
    }
}

// Update Auth UI
function updateAuthUI() {
    const authBtn = document.getElementById('authBtn');
    const registerNavBtn = document.getElementById('registerNavBtn');
    const userInfo = document.getElementById('userInfo');
    const userRole = document.getElementById('userRole');
    const addProductBtn = document.getElementById('addProductBtn');
    const shopDashLink = document.getElementById('shopDashLink');
    const adminAnalyticsLink = document.getElementById('adminAnalyticsLink');

    if (token) {
        authBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        authBtn.onclick = logout;
        authBtn.style.display = 'inline-flex';
        if (registerNavBtn) registerNavBtn.style.display = 'none';
        userInfo.style.display = 'flex';
        userInfo.onclick = openCustomerModal;
        userInfo.style.cursor = 'pointer';
        userRole.textContent = userRole_var.toUpperCase();
        
        // Show add product button and dashboard for shop/wholesale/admin
        if (userRole_var === 'shop' || userRole_var === 'wholesale' || userRole_var === 'admin') {
            if (addProductBtn) addProductBtn.style.display = 'inline-flex';
            if (shopDashLink) shopDashLink.style.display = 'inline-flex';
        }
        if (adminAnalyticsLink) {
            adminAnalyticsLink.style.display = userRole_var === 'admin' ? 'inline-flex' : 'none';
        }
    } else {
        authBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        authBtn.onclick = () => showPage('login');
        authBtn.style.display = 'inline-flex';
        if (registerNavBtn) registerNavBtn.style.display = 'inline-flex';
        userInfo.style.display = 'none';
        userInfo.onclick = null;
        if (addProductBtn) {
            addProductBtn.style.display = 'none';
        }
        if (shopDashLink) shopDashLink.style.display = 'none';
        if (adminAnalyticsLink) adminAnalyticsLink.style.display = 'none';
    }
}

// Products
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const apiProducts = await response.json();
        console.log('API Products:', apiProducts);
        
        const products = Array.isArray(apiProducts) && apiProducts.length > 0 ? apiProducts : sampleProducts;
        console.log('Using products:', products.length, 'items');
        allProductsCache = products;
        renderProducts(products);
    } catch (error) {
        console.error('Failed to load products:', error);
        // Use sample products as fallback
        const productsList = document.getElementById('productsList');
        productsList.innerHTML = '<p style="text-align:center;padding:20px;color:#e74c3c;">Error loading products. Using sample data...</p>';
        
        // Try to load with sample products
        setTimeout(() => {
            loadProductsFromSample();
        }, 100);
    }
}

// Fallback function to load sample products
function loadProductsFromSample() {
    allProductsCache = sampleProducts;
    renderProducts(sampleProducts);
}

function applyProductFilters(products) {
    let filtered = Array.isArray(products) ? [...products] : [];
    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => (p.category || '').toLowerCase() === currentCategory);
    }
    if (currentSearchTerm) {
        const term = currentSearchTerm.toLowerCase();
        filtered = filtered.filter(p => {
            const name = (p.name || '').toLowerCase();
            const category = (p.category || '').toLowerCase();
            return name.includes(term) || category.includes(term);
        });
    }
    return filtered;
}

function renderProducts(products) {
    const productsList = document.getElementById('productsList');
    if (!productsList) return;
    productsList.innerHTML = '';

    const filteredProducts = applyProductFilters(products);

    if (filteredProducts.length === 0) {
        productsList.innerHTML = '<p style="text-align:center;padding:40px;color:#666;">No products found.</p>';
        return;
    }

    const categories = {
        'fruits': { name: 'Fruits 🍎', name_hi: 'फल 🍎', name_ta: 'பழங்கள் 🍎', products: [] },
        'vegetables': { name: 'Vegetables 🥕', name_hi: 'सब्जियाँ 🥕', name_ta: 'காய்கறிகள் 🥕', products: [] },
        'grains': { name: 'Grains & Bread 🌾', name_hi: 'अनाज और ब्रेड 🌾', name_ta: 'தானியங்கள் 🌾', products: [] },
        'dairy': { name: 'Dairy 🥛', name_hi: 'डेयरी 🥛', name_ta: 'பால் பொருட்கள் 🥛', products: [] },
        'oils': { name: 'Oils & Spices 🌶️', name_hi: 'तेल और मसाले 🌶️', name_ta: 'எண்ணெய்கள் 🌶️', products: [] },
        'makeup': { name: 'Makeup 💄', name_hi: 'मेकअप 💄', name_ta: 'அழகு பொருட்கள் 💄', products: [] },
        'shampoos': { name: 'Shampoos 🧴', name_hi: 'शैंपू 🧴', name_ta: 'சாம்பு 🧴', products: [] }
    };

    filteredProducts.forEach(product => {
        const cat = product.category || 'other';
        if (categories[cat]) {
            categories[cat].products.push(product);
        }
    });

    Object.keys(categories).forEach(catKey => {
        const category = categories[catKey];
        if (category.products.length > 0) {
            const categorySection = document.createElement('div');
            categorySection.className = 'category-section';

            const categoryTitle = document.createElement('h2');
            categoryTitle.className = 'category-title';
            categoryTitle.textContent = category.name;
            categorySection.appendChild(categoryTitle);

            const categoryGrid = document.createElement('div');
            categoryGrid.className = 'category-products';

            category.products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';

                let defaultImage = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';
                if (product.category === 'fruits') {
                    defaultImage = 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80';
                } else if (product.category === 'vegetables') {
                    defaultImage = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
                } else if (product.category === 'grains') {
                    defaultImage = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80';
                } else if (product.category === 'dairy') {
                    defaultImage = 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80';
                } else if (product.category === 'oils') {
                    defaultImage = 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80';
                } else if (product.category === 'makeup') {
                    defaultImage = 'https://images.unsplash.com/photo-1607745882099-e1b7f6fb89d7?auto=format&fit=crop&w=800&q=80';
                } else if (product.category === 'shampoos') {
                    defaultImage = 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80';
                }

                const image = product.image || defaultImage;

                card.innerHTML = `
                    <img src="${image}" alt="${product.name}" class="product-img" loading="lazy" onerror="this.src='${defaultImage}'" />
                    <h3>${product.name}</h3>
                    <p class="price">₹${product.price}</p>
                    <div class="product-meta">
                        <span class="badge-stock">Stock: ${product.stock ?? 'N/A'}</span>
                        <span><i class="fas fa-store"></i> ${t('freshTag')}</span>
                    </div>
                    ${token && userRole_var === 'customer' ? 
                        `<div class="product-actions">
                            <button class="btn btn-primary" onclick="addToCart('${product._id}', '${product.name}', ${product.price})"><i class="fas fa-cart-plus"></i> Add to Cart</button>
                            <button class="btn btn-buy" onclick="buyNow('${product._id}', '${product.name}', ${product.price})"><i class="fas fa-bolt"></i> ${t('buyNow')}</button>
                        </div>` 
                        : !token ? `<div class="product-actions">
                            <button class="btn btn-primary" onclick="showAuthPopup()" style="width: 100%;"><i class="fas fa-lock"></i> Login to Shop</button>
                        </div>` 
                        : ''}
                    ${token && userRole_var === 'admin' ? 
                        `<button class="btn btn-secondary" onclick="openEditProductModal('${product._id}')"><i class="fas fa-pen"></i> Edit Product</button>`
                        : ''}
                `;
                categoryGrid.appendChild(card);
            });

            categorySection.appendChild(categoryGrid);
            productsList.appendChild(categorySection);
        }
    });
}

function openEditProductModal(productId) {
    if (!token || userRole_var !== 'admin') {
        showToast('Access denied', 'error');
        return;
    }

    const product = allProductsCache.find((item) => String(item._id) === String(productId));
    if (!product) {
        showToast('Product not found', 'error');
        return;
    }

    editingProductId = productId;

    const nameInput = document.getElementById('editProductName');
    const priceInput = document.getElementById('editProductPrice');
    const stockInput = document.getElementById('editProductStock');
    const imageInput = document.getElementById('editProductImage');
    const messageEl = document.getElementById('editProductMessage');
    const modal = document.getElementById('editProductModal');

    if (!nameInput || !priceInput || !stockInput || !imageInput || !messageEl || !modal) {
        showToast('Edit form is not available', 'error');
        return;
    }

    nameInput.value = product.name || '';
    priceInput.value = product.price ?? '';
    stockInput.value = product.stock ?? 0;
    imageInput.value = product.image || '';
    bindEditImagePreview(imageInput);
    updateEditImagePreview(imageInput.value);
    messageEl.textContent = '';
    messageEl.style.color = '';
    modal.classList.add('active');
}

function updateEditImagePreview(imageUrl) {
    const preview = document.getElementById('editProductImagePreview');
    if (!preview) {
        return;
    }

    const fallback = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';
    const normalizedUrl = normalizeProductImageUrl(imageUrl);
    preview.src = normalizedUrl || fallback;
    preview.onerror = () => {
        preview.src = fallback;
        if (normalizedUrl) {
            setEditProductMessage('This URL is not a direct image link. Open image in new tab and copy that URL.', 'error');
        }
    };
}

function normalizeProductImageUrl(rawUrl) {
    const trimmed = (rawUrl || '').trim();
    if (!trimmed) {
        return '';
    }

    try {
        const parsed = new URL(trimmed);
        const directUrlParams = ['imgurl', 'mediaurl', 'mediaUrl', 'url'];
        for (const key of directUrlParams) {
            const candidate = parsed.searchParams.get(key);
            if (candidate && /^https?:\/\//i.test(candidate)) {
                return candidate;
            }
        }
        return trimmed;
    } catch (error) {
        return trimmed;
    }
}

function bindEditImagePreview(imageInput) {
    if (!imageInput) {
        return;
    }

    if (imageInput.dataset.previewBound === 'true') {
        return;
    }

    imageInput.addEventListener('input', (event) => {
        updateEditImagePreview(event.target.value);
    });

    imageInput.addEventListener('blur', () => {
        const normalized = normalizeProductImageUrl(imageInput.value);
        if (normalized !== imageInput.value.trim()) {
            imageInput.value = normalized;
        }
        updateEditImagePreview(imageInput.value);
    });

    imageInput.addEventListener('paste', () => {
        setTimeout(() => {
            const normalized = normalizeProductImageUrl(imageInput.value);
            if (normalized !== imageInput.value.trim()) {
                imageInput.value = normalized;
            }
            updateEditImagePreview(imageInput.value);
        }, 0);
    });

    imageInput.dataset.previewBound = 'true';
}

function hideEditProduct() {
    const modal = document.getElementById('editProductModal');
    const messageEl = document.getElementById('editProductMessage');
    if (modal) {
        modal.classList.remove('active');
    }
    if (messageEl) {
        messageEl.textContent = '';
        messageEl.style.color = '';
    }
    editingProductId = null;
}

function setEditProductMessage(message, type = 'error') {
    const messageEl = document.getElementById('editProductMessage');
    if (!messageEl) return;
    messageEl.textContent = message;
    messageEl.style.color = type === 'success' ? 'green' : 'red';
}

async function saveProductEdits() {
    if (!editingProductId) {
        return;
    }

    const nextName = (document.getElementById('editProductName').value || '').trim();
    const nextPrice = Number(document.getElementById('editProductPrice').value);
    const nextStock = Number(document.getElementById('editProductStock').value);
    const nextImageRaw = (document.getElementById('editProductImage').value || '').trim();
    const nextImage = normalizeProductImageUrl(nextImageRaw);

    if (nextImage && !/^https?:\/\//i.test(nextImage)) {
        setEditProductMessage('Please paste a valid image URL (http/https)');
        return;
    }

    if (!nextName) {
        setEditProductMessage('Please enter a product name');
        return;
    }

    if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
        setEditProductMessage('Please enter a valid price');
        return;
    }

    if (!Number.isFinite(nextStock) || nextStock < 0 || !Number.isInteger(nextStock)) {
        setEditProductMessage('Please enter a valid stock (0 or more)');
        return;
    }

    try {
        setEditProductMessage('');
        const response = await fetch(`${API_URL}/products/${editingProductId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: nextName,
                price: nextPrice,
                stock: nextStock,
                image: nextImage
            })
        });

        const data = await response.json();
        if (!response.ok) {
            setEditProductMessage(data.message || 'Failed to update product');
            return;
        }

        showToast('Product updated successfully', 'success');
        hideEditProduct();
        loadProducts();
    } catch (error) {
        console.error('Failed to update product:', error);
        setEditProductMessage('Failed to update product');
    }
}

function clearProductSearch() {
    const searchInput = document.getElementById('productSearchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    currentSearchTerm = '';
    if (allProductsCache.length > 0) {
        renderProducts(allProductsCache);
    } else {
        loadProducts();
    }
}

function filterByCategory(category) {
    currentCategory = category;
    
    // Update active tab
    const tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    const activeTab = document.querySelector(`[data-category="${category}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    if (allProductsCache.length > 0) {
        renderProducts(allProductsCache);
    } else {
        loadProducts();
    }
    
    // Scroll to products list
    document.getElementById('productsList').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showAddProduct() {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function hideAddProduct() {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

async function addProduct() {
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const stock = document.getElementById('productStock').value;
    const image = document.getElementById('productImage').value;
    const category = document.getElementById('productCategory').value;

    if (!category) {
        showToast('Please select a category', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/products/add`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, price, stock, image, category, shopId: 'shop123' })
        });

        const data = await response.json();
        showToast(data.message || 'Product added successfully!', 'success');
        hideAddProduct();
        loadProducts();
        
        // Clear form
        document.getElementById('productName').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('productStock').value = '';
        document.getElementById('productImage').value = '';
        document.getElementById('productCategory').value = '';
    } catch (error) {
        showToast('Failed to add product!', 'error');
    }
}

// Authentication Check Function
function checkAuthBeforeAction() {
    if (!token || !userRole_var) {
        showAuthPopup();
        return false;
    }
    if (userRole_var !== 'customer') {
        alert('Only customers can shop. Please login as a customer.');
        return false;
    }
    return true;
}

// Show Auth Popup Modal
function showAuthPopup() {
    let modal = document.getElementById('authPopupModal');
    
    if (!modal) {
        // Create modal if it doesn't exist
        modal = document.createElement('div');
        modal.id = 'authPopupModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                    <h2>🔐 Login Required</h2>
                    <button onclick="closeAuthPopup()" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                </div>
                <div class="modal-body" style="padding: 20px;">
                    <p style="text-align: center; color: #666; margin-bottom: 20px; font-size: 14px;">
                        You need to login or register to shop and add items to cart.
                    </p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <button class="btn btn-primary" onclick="loginFromPopup()" style="width: 100%;">
                            <i class="fas fa-sign-in-alt"></i> Login
                        </button>
                        <button class="btn btn-secondary" onclick="registerFromPopup()" style="width: 100%;">
                            <i class="fas fa-user-plus"></i> Register
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    modal.classList.add('active');
}

// Close Auth Popup
function closeAuthPopup() {
    const modal = document.getElementById('authPopupModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Login from Popup
function loginFromPopup() {
    closeAuthPopup();
    showPage('login');
    switchTab('login');
}

// Register from Popup
function registerFromPopup() {
    closeAuthPopup();
    showPage('login');
    switchTab('register');
}

// Cart
async function addToCart(productId, productName, price) {
    if (!checkAuthBeforeAction()) {
        return;
    }
    
    try {
        // Call API to reduce stock
        const response = await fetch(`${API_URL}/products/add-to-cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId: productId,
                quantity: 1
            })
        });
        
        const data = await response.json();
        console.log('Add to cart response:', data);
        
        if (!response.ok) {
            alert(`Error: ${data.message}`);
            return;
        }
        
        // Add to local cart if stock reduction successful
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id: productId, name: productName, price: price, quantity: 1 });
        }
        
        updateCartUI();
        alert(`${productName} ${translations[currentLang].addToCartAlert}`);
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart. Please try again.');
    }
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById('cartCount');
    const cartCountFab = document.getElementById('cartCountFab');
    if (cartCount) cartCount.textContent = totalItems;
    if (cartCountFab) cartCountFab.textContent = totalItems;
}

async function buyNow(productId, productName, price) {
    if (!checkAuthBeforeAction()) {
        return;
    }
    
    await addToCart(productId, productName, price);
    const cartModal = document.getElementById('cartModal');
    if (cartModal && !cartModal.classList.contains('active')) {
        toggleCart();
    }
}

function toggleCart() {
    const modal = document.getElementById('cartModal');
    modal.classList.toggle('active');
    
    if (modal.classList.contains('active')) {
        displayCart();
    }
}

function displayCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    // Check if cart is empty
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Your cart is empty</p>';
        cartTotal.textContent = '0';
        return;
    }
    
    let total = 0;
    cartItems.innerHTML = '';
    
    // Render each cart item with quantity controls
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-details">
                <div class="item-info">
                    <strong class="item-name">${item.name}</strong>
                    <small class="item-price">₹${item.price} per unit</small>
                </div>
                
                <div class="quantity-controls">
                    <button class="qty-btn qty-minus" onclick="decreaseQuantity(${index})" title="Decrease quantity">−</button>
                    <input type="number" class="qty-input" value="${item.quantity}" readonly min="1">
                    <button class="qty-btn qty-plus" onclick="increaseQuantity(${index})" title="Increase quantity">+</button>
                </div>
            </div>
            
            <strong class="total-price">₹${itemTotal}</strong>
            <button class="btn btn-remove" onclick="removeFromCart(${index})" title="Remove from cart">
                <i class="fas fa-trash"></i> Remove
            </button>
        `;
        cartItems.appendChild(cartItem);
    });
    
    // Update cart total
    cartTotal.textContent = total;
}

// Increase product quantity in cart
function increaseQuantity(index) {
    if (index >= 0 && index < cart.length) {
        cart[index].quantity += 1;
        updateCartUI();
        displayCart();
    }
}

// Decrease product quantity in cart (minimum 1)
function decreaseQuantity(index) {
    if (index >= 0 && index < cart.length) {
        // Prevent quantity from going below 1
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            // If quantity is 1 and user clicks minus, ask if they want to remove
            if (confirm('Remove this item from cart?')) {
                removeFromCart(index);
                return;
            }
        }
        updateCartUI();
        displayCart();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
    displayCart();
}

async function placeOrder() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const paymentMode = document.getElementById('paymentMode').value;
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    try {
        if (paymentMode === 'cod') {
            // Cash on Delivery
            const response = await fetch(`${API_URL}/orders/add`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    customerId: 'customer123',
                    shopId: 'shop123',
                    products: cart,
                    totalAmount,
                    paymentMode: 'cod'
                })
            });

            const data = await response.json();
            showToast(`${t('orderSuccess')} - ${t('payCOD')}`);
            cart = [];
            updateCartUI();
            toggleCart();
        } else if (paymentMode === 'online' || paymentMode === 'gpay' || paymentMode === 'phonepe' || paymentMode === 'paytm') {
            // All online payment methods use Razorpay
            await initializeRazorpayPayment(totalAmount, paymentMode);
        } else {
            alert('Please select a valid payment method!');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Failed to place order!');
    }
}

// Initialize Razorpay Payment
async function initializeRazorpayPayment(totalAmount, paymentMethod = 'online') {
    try {
        // Step 1: Create payment order on backend
        const paymentOrderResponse = await fetch(`${API_URL}/orders/create-payment-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerId: 'customer123',
                shopId: 'shop123',
                products: cart,
                totalAmount: totalAmount,
                paymentMethod: paymentMethod
            })
        });

        const paymentOrder = await paymentOrderResponse.json();
        console.log('Payment order response:', paymentOrder);

        if (!paymentOrderResponse.ok) {
            throw new Error(paymentOrder.message || 'Failed to create payment order');
        }

        // Determine payment method name
        let paymentMethodName = 'Online Payment';
        if (paymentMethod === 'gpay') paymentMethodName = 'Google Pay';
        else if (paymentMethod === 'phonepe') paymentMethodName = 'PhonePe';
        else if (paymentMethod === 'paytm') paymentMethodName = 'Paytm';

        // Step 2: Open Razorpay Checkout
        const options = {
            key: paymentOrder.keyId,
            amount: totalAmount * 100,
            currency: "INR",
            name: "Gayathiri Grocery Mart",
            description: `Order Payment via ${paymentMethodName}`,
            order_id: paymentOrder.razorpayOrderId,
            handler: async function(response) {
                // Step 3: Verify payment on backend
                await verifyPayment(response, paymentOrder.orderId);
            },
            prefill: {
                name: "Customer",
                email: "customer@arokayagrocerymart.com",
                contact: "9999999999"
            },
            theme: {
                color: "#3399cc"
            },
            modal: {
                ondismiss: async function() {
                    console.log('Payment modal dismissed');
                    await handlePaymentFailure(paymentOrder.orderId);
                }
            }
        };

        console.log('Opening Razorpay with options:', options);
        const rzp1 = new Razorpay(options);
        
        rzp1.on('payment.failed', async function (response) {
            console.error('Payment failed:', response);
            await handlePaymentFailure(paymentOrder.orderId);
        });
        
        rzp1.open();
    } catch (error) {
        console.error('Razorpay initialization error:', error);
        alert(`Failed to initialize payment: ${error.message}. Please try again.`);
    }
}

// Verify Payment after successful Razorpay transaction
async function verifyPayment(paymentData, orderId) {
    try {
        const response = await fetch(`${API_URL}/orders/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                razorpay_order_id: paymentData.razorpay_order_id,
                razorpay_payment_id: paymentData.razorpay_payment_id,
                razorpay_signature: paymentData.razorpay_signature,
                orderId: orderId
            })
        });

        const data = await response.json();

        if (data.paymentValid) {
            showToast(`${t('orderSuccess')} - Payment Confirmed!`);
            cart = [];
            updateCartUI();
            toggleCart();
            
            // Reload orders to show the new order
            setTimeout(() => loadOrders(), 1000);
        } else {
            showToast('Payment verification failed. Please contact support.');
            await handlePaymentFailure(orderId);
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        showToast('Payment verification failed!');
        await handlePaymentFailure(orderId);
    }
}

// Handle Payment Failure
async function handlePaymentFailure(orderId) {
    try {
        const response = await fetch(`${API_URL}/orders/payment-failed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId })
        });

        const data = await response.json();
        console.log('Payment failure handled:', data);
        showToast('Payment failed. Your order has been cancelled.');
    } catch (error) {
        console.error('Payment failure handling error:', error);
    }
}

function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return alert(message);
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
}

// Orders
async function loadOrders() {
    try {
        const response = await fetch(`${API_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const orders = await response.json();
        
        const ordersList = document.getElementById('ordersList');
        ordersList.innerHTML = '';

        if (orders.length === 0) {
            ordersList.innerHTML = '<p>No orders found</p>';
            return;
        }

        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
            orderCard.innerHTML = `
                <h4>Order #${order._id.substring(0, 8)}</h4>
                <p><strong>Total:</strong> ₹${order.totalAmount}</p>
                <p><strong>Payment:</strong> ${order.paymentMode}</p>
                <p><strong>Status:</strong> <span class="order-status ${order.status.toLowerCase()}">${order.status}</span></p>
                <p><strong>Items:</strong> ${order.products.length}</p>
            `;
            ordersList.appendChild(orderCard);
        });
    } catch (error) {
        console.error('Failed to load orders:', error);
    }
}

// ================= Shop Owner Dashboard =================
let shopOrdersCache = [];

async function loadShopOrders() {
    try {
        // Admin can monitor all orders, while shop/wholesale sees their shop-specific orders.
        const endpoint = userRole_var === 'admin'
            ? `${API_URL}/orders`
            : `${API_URL}/orders/shop/shop123`;

        const res = await fetch(endpoint);
        shopOrdersCache = await res.json();
        renderShopOrders();
    } catch (error) {
        console.error('Failed to load shop orders:', error);
    }
}

function renderShopOrders() {
    const pendingEl = document.getElementById('pendingOrders');
    const allEl = document.getElementById('allShopOrders');
    const filterSel = document.getElementById('statusFilter');
    if (!pendingEl || !allEl) return;
    
    const pending = shopOrdersCache.filter(o => o.status === 'Pending');
    pendingEl.innerHTML = pending.length ? '' : '<p>No pending orders</p>';
    pending.forEach(o => pendingEl.appendChild(buildOrderCard(o, true)));
    
    let list = shopOrdersCache;
    if (filterSel && filterSel.value !== 'all') {
        list = list.filter(o => o.status === filterSel.value);
    }
    allEl.innerHTML = list.length ? '' : '<p>No orders</p>';
    list.forEach(o => allEl.appendChild(buildOrderCard(o, false)));
}

function buildOrderCard(order, showApproveReject) {
    const card = document.createElement('div');
    card.className = 'order-card';
    const itemsCount = Array.isArray(order.products) ? order.products.length : 0;
    card.innerHTML = `
        <h4>Order #${(order._id || '').toString().substring(0, 8)}</h4>
        <p><strong>Total:</strong> ₹${order.totalAmount}</p>
        <p><strong>Payment:</strong> ${order.paymentMode}</p>
        <p><strong>Status:</strong> <span class="order-status ${String(order.status||'').toLowerCase()}">${order.status}</span></p>
        <p><strong>Items:</strong> ${itemsCount}</p>
    `;
    const actions = document.createElement('div');
    actions.className = 'order-actions';
    if (showApproveReject) {
        actions.innerHTML = `
            <button class="btn btn-approve" onclick="setOrderStatus('${order._id}','Approved')">Approve</button>
            <button class="btn btn-reject" onclick="setOrderStatus('${order._id}','Rejected')">Reject</button>
        `;
    } else {
        actions.innerHTML = `
            <button class="btn btn-pack" onclick="setOrderStatus('${order._id}','Packed')">Mark Packed</button>
            <button class="btn btn-out" onclick="setOrderStatus('${order._id}','Out for Delivery')">Out for Delivery</button>
            <button class="btn btn-delivered" onclick="setOrderStatus('${order._id}','Delivered')">Delivered</button>
        `;
    }
    card.appendChild(actions);
    return card;
}

async function setOrderStatus(orderId, status) {
    try {
        await fetch(`${API_URL}/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        await loadShopOrders();
    } catch (error) {
        console.error('Failed to update order status:', error);
    }
}

// AI Assistant
const aiKnowledge = {
    products: [
        { name: 'Fresh Apples (1kg)', price: 120, stock: 40, category: 'fruits' },
        { name: 'Bananas (1 Dozen)', price: 60, stock: 50, category: 'fruits' },
        { name: 'Tomatoes (1kg)', price: 45, stock: 80, category: 'vegetables' },
        { name: 'Onions (1kg)', price: 35, stock: 100, category: 'vegetables' },
        { name: 'Potatoes (1kg)', price: 30, stock: 120, category: 'vegetables' },
        { name: 'Broccoli (500g)', price: 55, stock: 35, category: 'vegetables' },
        { name: 'Spinach (1 bunch)', price: 25, stock: 60, category: 'vegetables' },
        { name: 'Whole Wheat Bread', price: 45, stock: 25, category: 'grains' },
        { name: 'Basmati Rice (5kg)', price: 520, stock: 20, category: 'grains' },
        { name: 'Sunflower Oil (1L)', price: 150, stock: 30, category: 'oils' },
        { name: 'Milk (1L)', price: 55, stock: 90, category: 'dairy' },
        { name: 'Eggs (6 pack)', price: 65, stock: 70, category: 'dairy' }
    ]
};

function getAIResponse(userInput) {
    const input = userInput.toLowerCase();
    let response = '';
    
    // Check for product-specific queries
    if (input.includes('price') || input.includes('cost') || input.includes('rupee') || input.includes('₹')) {
        const productName = extractProductName(input);
        if (productName) {
            const product = aiKnowledge.products.find(p => p.name.toLowerCase().includes(productName.toLowerCase()));
            if (product) {
                return `${product.name}: ₹${product.price}`;
            }
        }
        return 'Which product would you like to know the price of?';
    }
    
    // Check for stock/availability queries
    if (input.includes('stock') || input.includes('available') || input.includes('in stock') || input.includes('have')) {
        const productName = extractProductName(input);
        if (productName) {
            const product = aiKnowledge.products.find(p => p.name.toLowerCase().includes(productName.toLowerCase()));
            if (product) {
                return `${product.name}: ${product.stock} units available in stock.`;
            }
        }
        return 'Please specify which product you want to check availability for.';
    }
    
    // Check for product recommendations by category
    if (input.includes('apple') || input.includes('fruit')) {
        const fruits = aiKnowledge.products.filter(p => p.category === 'fruits');
        response = t('aiRecommend') + ': ' + fruits.map(p => `${p.name} (₹${p.price})`).join(', ');
        return response;
    }
    
    if (input.includes('rice') || input.includes('grain') || input.includes('bread') || input.includes('wheat')) {
        const grains = aiKnowledge.products.filter(p => p.category === 'grains');
        response = t('aiRecommend') + ': ' + grains.map(p => `${p.name} (₹${p.price})`).join(', ');
        return response;
    }
    
    if (input.includes('milk') || input.includes('dairy') || input.includes('egg')) {
        const dairy = aiKnowledge.products.filter(p => p.category === 'dairy');
        response = t('aiRecommend') + ': ' + dairy.map(p => `${p.name} (₹${p.price})`).join(', ');
        return response;
    }
    
    if (input.includes('oil') || input.includes('cook')) {
        const oils = aiKnowledge.products.filter(p => p.category === 'oils');
        response = t('aiRecommend') + ': ' + oils.map(p => `${p.name} (₹${p.price})`).join(', ');
        return response;
    }
    
    if (input.includes('vegetable') || input.includes('onion') || input.includes('potato') || input.includes('tomato') || input.includes('broccoli')) {
        const veggies = aiKnowledge.products.filter(p => p.category === 'vegetables');
        response = t('aiRecommend') + ': ' + veggies.map(p => `${p.name} (₹${p.price})`).join(', ');
        return response;
    }
    
    // Customer service queries
    if (input.includes('delivery') || input.includes('fast') || input.includes('time')) {
        return 'We offer fast delivery within minutes! Your fresh groceries will reach you quickly.';
    }
    
    if (input.includes('payment') || input.includes('pay') || input.includes('method')) {
        return 'We accept: Cash on Delivery (COD), Google Pay (GPay), PhonePe, and Paytm. Choose your preferred payment method at checkout!';
    }
    
    if (input.includes('return') || input.includes('refund') || input.includes('cancel')) {
        return 'You can cancel or modify your order within 5 minutes of placing it. Contact our support for refunds.';
    }
    
    if (input.includes('fresh') || input.includes('quality')) {
        return 'All our products are sourced fresh daily to ensure the highest quality. We guarantee fresh groceries!';
    }
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
        return t('aiGreeting');
    }
    
    if (input.includes('help') || input.includes('support') || input.includes('problem')) {
        return 'How can I help you? You can ask me about:\n• Product prices and availability\n• Delivery and payment methods\n• Product recommendations\n• Our policies';
    }
    
    // All products list
    if (input.includes('all') || input.includes('list') || input.includes('everything')) {
        const allProducts = aiKnowledge.products.map(p => `${p.name} (₹${p.price})`).join(', ');
        return 'Our products: ' + allProducts;
    }
    
    // Default response
    return t('aiAskProduct') + ' ' + t('aiGreeting') + '\n\nTry asking about prices, availability, or product recommendations!';
}

function extractProductName(input) {
    for (let product of aiKnowledge.products) {
        if (input.includes(product.name.toLowerCase()) || product.name.toLowerCase().split(' ').some(word => input.includes(word))) {
            return product.name;
        }
    }
    return null;
}

function toggleAIChat() {
    const chatBox = document.getElementById('aiChatBox');
    if (chatBox) {
        chatBox.classList.toggle('active');
        const input = chatBox.querySelector('.ai-input');
        if (input && chatBox.classList.contains('active')) {
            input.focus();
        }
    }
}

function sendAIMessage() {
    const input = document.getElementById('aiInput');
    const chatMessages = document.getElementById('aiMessages');
    
    if (!input.value.trim()) return;
    
    // User message
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-msg user';
    userMsg.textContent = input.value;
    chatMessages.appendChild(userMsg);
    
    // AI Response
    const response = getAIResponse(input.value);
    setTimeout(() => {
        const aiMsg = document.createElement('div');
        aiMsg.className = 'ai-msg bot';
        aiMsg.textContent = response;
        chatMessages.appendChild(aiMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 300);
    
    input.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

