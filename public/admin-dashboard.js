// API Base URL
const API_ROOT = `${window.location.origin}/api`;

const API_BASE = `${API_ROOT}/admin`;

// Chart color palettes
const chartColors = {
    primary: '#4CAF50',
    secondary: '#2196F3',
    success: '#8BC34A',
    warning: '#FFC107',
    danger: '#F44336',
    info: '#00BCD4',
    light: '#E0E0E0',
    dark: '#424242'
};

const categoryColors = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#FF6384',
    '#C9CBCF',
    '#4BC0C0',
    '#FF9F40'
];

const REALTIME_REFRESH_MS = 15000;
let autoRefreshTimer = null;
let isDashboardRefreshing = false;

/**
 * Initialize dashboard on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    validateAdminAccess().then((isAdmin) => {
        if (isAdmin) {
            loadDashboardData(true);
            startAutoRefresh();
        }
    });
});

async function validateAdminAccess() {
    // Accept token from either admin-login or main customer app login
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const role = localStorage.getItem('adminRole') || localStorage.getItem('role');

    if (!token || role !== 'admin') {
        window.location.href = 'admin-login.html';
        return false;
    }

    try {
        const res = await fetch(`${API_ROOT}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
            throw new Error('Profile fetch failed');
        }
        const user = await res.json();
        if (!user || user.role !== 'admin') {
            alert('Access denied. Admins only.');
            window.location.href = 'index.html';
            return false;
        }
        // Sync token keys so dashboard API calls always have adminToken
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminRole', user.role);
        return true;
    } catch (error) {
        console.error('Admin access validation failed:', error);
        alert('Unable to verify admin access. Please log in again.');
        window.location.href = 'index.html';
        return false;
    }
}

/**
 * Show loading spinner
 */
function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'flex';
}

/**
 * Hide loading spinner
 */
function hideLoading() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

/**
 * Update last updated timestamp
 */
function updateTimestamp() {
    const now = new Date();
    const timeStr = now.toLocaleString();
    document.getElementById('lastUpdated').textContent = timeStr;
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return new Intl.NumberFormat('en-IN').format(Math.round(num));
}

/**
 * Fetch all dashboard data
 */
async function loadDashboardData(force = false) {
    if (isDashboardRefreshing && !force) {
        return;
    }

    isDashboardRefreshing = true;
    showLoading();
    try {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Fetch data in parallel
        const [analyticsRes, productSalesRes, categorySalesRes, trendsRes] = await Promise.all([
            fetch(`${API_BASE}/analytics`, { headers }),
            fetch(`${API_BASE}/product-sales`, { headers }),
            fetch(`${API_BASE}/category-sales`, { headers }),
            fetch(`${API_BASE}/sales-trends?period=daily`, { headers })
        ]);

        if (!analyticsRes.ok || !productSalesRes.ok || !categorySalesRes.ok || !trendsRes.ok) {
            throw new Error('Failed to fetch analytics data');
        }

        const analytics = await analyticsRes.json();
        const productSales = await productSalesRes.json();
        const categorySales = await categorySalesRes.json();
        const trends = await trendsRes.json();

        // Update summary cards
        updateSummaryCards(analytics.summary);

        // Update charts
        updateProductSalesChart(productSales);
        updateSalesTrendsChart(trends);

        // Update best products table
        updateBestProductsTable(analytics.bestSellingProducts);

        // Update category breakdown
        updateCategoryBreakdown(analytics.categoryDistribution);

        // Update timestamp
        updateTimestamp();

        hideLoading();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        hideLoading();
        alert('Failed to load dashboard data. Please refresh the page.');
    } finally {
        isDashboardRefreshing = false;
    }
}

/**
 * Refresh all data
 */
async function refreshAllData() {
    const btn = document.getElementById('refreshBtn');
    btn.disabled = true;
    btn.textContent = '⏳ Refreshing...';
    
    await loadDashboardData(true);
    
    btn.disabled = false;
    btn.textContent = '🔄 Refresh Data';
}

/**
 * Update summary cards with metrics
 */
function updateSummaryCards(summary) {
    document.getElementById('totalOrders').textContent = formatNumber(summary.totalOrders);
    document.getElementById('totalRevenue').textContent = formatCurrency(summary.totalRevenue);
    document.getElementById('avgOrderValue').textContent = formatCurrency(summary.avgOrderValue);
    document.getElementById('totalProductsSold').textContent = formatNumber(summary.totalProductsSold);
}

/**
 * Update product-wise sales bar chart
 */
function updateProductSalesChart(data) {
    const ctx = document.getElementById('productSalesChart').getContext('2d');
    
    // Destroy existing chart
    if (charts.productSales) {
        charts.productSales.destroy();
    }

    charts.productSales = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Quantity Sold',
                    data: data.quantities,
                    backgroundColor: chartColors.primary,
                    borderColor: chartColors.primary,
                    borderWidth: 2,
                    yAxisID: 'y',
                    borderRadius: 5,
                    hoverBackgroundColor: chartColors.success
                },
                {
                    label: 'Revenue (₹)',
                    data: data.revenues,
                    backgroundColor: chartColors.secondary,
                    borderColor: chartColors.secondary,
                    borderWidth: 2,
                    yAxisID: 'y1',
                    borderRadius: 5,
                    hoverBackgroundColor: chartColors.info
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        padding: 15,
                        font: { size: 12, weight: 'bold' }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 12,
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 },
                    borderColor: chartColors.primary,
                    borderWidth: 1,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.dataset.yAxisID === 'y1') {
                                label += formatCurrency(context.parsed.y);
                            } else {
                                label += formatNumber(context.parsed.y) + ' units';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Quantity Sold (Units)',
                        font: { weight: 'bold', size: 12 }
                    },
                    grid: {
                        drawBorder: true,
                        color: 'rgba(200, 200, 200, 0.1)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Revenue (₹)',
                        font: { weight: 'bold', size: 12 }
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                }
            }
        }
    });
}

/**
 * Update sales trends line chart
 */
function updateSalesTrendsChart(data) {
    const ctx = document.getElementById('salesTrendsChart').getContext('2d');
    
    // Destroy existing chart
    if (charts.salesTrends) {
        charts.salesTrends.destroy();
    }

    // Update subtitle
    const subtitle = data.timeFrame === 'monthly' ? 'Monthly sales performance' : 'Daily sales performance';
    document.getElementById('trendsSubtitle').textContent = subtitle;

    charts.salesTrends = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Revenue (₹)',
                    data: data.revenues,
                    borderColor: chartColors.primary,
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: chartColors.primary,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7,
                    yAxisID: 'y'
                },
                {
                    label: 'Orders',
                    data: data.counts,
                    borderColor: chartColors.secondary,
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: chartColors.secondary,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        padding: 15,
                        font: { size: 12, weight: 'bold' }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 12,
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 },
                    borderColor: '#fff',
                    borderWidth: 1,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.dataset.yAxisID === 'y1') {
                                label += formatNumber(context.parsed.y) + ' orders';
                            } else {
                                label += formatCurrency(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Revenue (₹)',
                        font: { weight: 'bold', size: 12 }
                    },
                    grid: {
                        color: 'rgba(200, 200, 200, 0.1)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Order Count',
                        font: { weight: 'bold', size: 12 }
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                }
            }
        }
    });
}

/**
 * Update best products table
 */
function updateBestProductsTable(products) {
    const tbody = document.getElementById('bestProductsBody');
    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No sales data available</td></tr>';
        return;
    }

    products.forEach((product, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="rank">${index + 1}</td>
            <td class="product-name">${product.name}</td>
            <td class="category"><span class="badge">${product.category}</span></td>
            <td class="quantity">${formatNumber(product.quantity)}</td>
            <td class="revenue">${formatCurrency(product.revenue)}</td>
            <td class="avg-price">${formatCurrency(product.revenue / product.quantity)}</td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Update category breakdown section
 */
function updateCategoryBreakdown(categories) {
    const grid = document.getElementById('categoryGrid');
    grid.innerHTML = '';

    categories.forEach((cat, index) => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.style.borderLeftColor = categoryColors[index % categoryColors.length];
        
        const categoryName = cat.name.charAt(0).toUpperCase() + cat.name.slice(1);
        
        card.innerHTML = `
            <div class="category-header">
                <h4>${categoryName}</h4>
            </div>
            <div class="category-stats">
                <div class="stat">
                    <span class="stat-label">Quantity Sold</span>
                    <span class="stat-value">${formatNumber(cat.quantity)}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Revenue</span>
                    <span class="stat-value">${formatCurrency(cat.revenue)}</span>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

/**
 * Update sales trends when period is changed
 */
async function updateSalesTrends() {
    const period = document.getElementById('periodSelect').value;
    showLoading();
    
    try {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const response = await fetch(`${API_BASE}/sales-trends?period=${period}`, { headers });
        
        if (!response.ok) {
            throw new Error('Failed to fetch sales trends');
        }
        
        const data = await response.json();
        updateSalesTrendsChart(data);
        hideLoading();
    } catch (error) {
        console.error('Error updating sales trends:', error);
        hideLoading();
        alert('Failed to update sales trends. Please try again.');
    }
}

/**
 * Switch between views (analytics/products)
 */
function switchView(view) {
    const analyticsView = document.getElementById('analyticsView');
    const productsView = document.getElementById('productsView');
    const analyticsBtn = document.getElementById('analyticsBtn');
    const productsBtn = document.getElementById('productsBtn');

    if (view === 'analytics') {
        analyticsView.classList.add('active');
        analyticsView.style.display = 'block';
        productsView.classList.remove('active');
        productsView.style.display = 'none';
        analyticsBtn.classList.add('active');
        productsBtn.classList.remove('active');
        // Hide the Add Products button while in analytics view
        if (productsBtn) productsBtn.style.display = 'none';
        startAutoRefresh();
    } else if (view === 'products') {
        analyticsView.classList.remove('active');
        analyticsView.style.display = 'none';
        productsView.classList.add('active');
        productsView.style.display = 'block';
        analyticsBtn.classList.remove('active');
        productsBtn.classList.add('active');
        // Ensure the Add Products button is visible when on products view
        if (productsBtn) productsBtn.style.display = '';
        stopAutoRefresh();
        // Load products list when switching to products view
        loadProductsList();
    }
}

/**
 * Load and display all products
 */
async function loadProductsList() {
    try {
        const response = await fetch(`${API_ROOT}/products`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        const products = await response.json();
        displayProductsList(products);
        displayLowStockAlerts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        const tbody = document.getElementById('productsListBody');
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Failed to load products</td></tr>';
    }
}

/**
 * Get stock status and severity
 */
function getStockStatus(stock) {
    if (stock < 5) {
        return { level: 'critical', label: '🔴 Critical', badge: 'critical' };
    } else if (stock < 15) {
        return { level: 'warning', label: '🟡 Low Stock', badge: 'warning' };
    } else if (stock < 30) {
        return { level: 'medium', label: '🟢 Medium', badge: 'normal' };
    } else {
        return { level: 'healthy', label: '✅ Healthy', badge: 'normal' };
    }
}

/**
 * Display low stock alerts
 */
function displayLowStockAlerts(products) {
    const lowStockAlerts = document.getElementById('lowStockAlerts');
    const lowStockContainer = document.getElementById('lowStockContainer');
    
    // Filter products with low stock (less than 15)
    const lowStockProducts = products.filter(p => p.stock < 15).sort((a, b) => a.stock - b.stock);
    
    if (lowStockProducts.length === 0) {
        lowStockAlerts.style.display = 'none';
        return;
    }
    
    lowStockAlerts.style.display = 'block';
    
    lowStockContainer.innerHTML = lowStockProducts.map(product => {
        const status = getStockStatus(product.stock);
        const fillPercentage = Math.min(product.stock / 15 * 100, 100);
        
        return `
            <div class="low-stock-item ${status.badge}">
                <div class="low-stock-item-details">
                    <div class="low-stock-item-name">${product.name}</div>
                    <div class="low-stock-item-stock">
                        Stock: <strong>${product.stock}</strong> units
                        <div class="stock-status-bar">
                            <div class="stock-status-fill" style="width: ${fillPercentage}%; background-color: ${status.badge === 'critical' ? '#f44336' : 'var(--warning-color)'}"></div>
                        </div>
                    </div>
                </div>
                <span class="stock-badge ${status.badge}">${status.label}</span>
            </div>
        `;
    }).join('');
}

/**
 * Display products in table
 */
function displayProductsList(products) {
    const tbody = document.getElementById('productsListBody');
    
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No products available</td></tr>';
        return;
    }

    tbody.innerHTML = products.map((product, index) => {
        const status = getStockStatus(product.stock);
        const rowClass = status.badge === 'critical' ? 'row-critical' : status.badge === 'warning' ? 'row-warning' : '';
        
        return `
            <tr class="${rowClass}">
                <td>${product.name}</td>
                <td><span class="category-badge">${product.category}</span></td>
                <td>₹${formatNumber(product.price)}</td>
                <td>
                    <div class="stock-status-cell">
                        <span class="stock-badge ${status.badge}">${product.stock}</span>
                        <span class="stock-label">${status.label}</span>
                    </div>
                </td>
                <td>
                    <button class="product-action-btn btn-delete" onclick="deleteProduct('${product._id}')">🗑️ Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Delete a product
 */
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const response = await fetch(`${API_ROOT}/admin/products/${productId}`, {
            method: 'DELETE',
            headers
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete product');
        }

        showSuccessMessage('Product deleted successfully!');
        setTimeout(() => {
            loadProductsList();
            hideMessages();
        }, 1000);
    } catch (error) {
        console.error('Error deleting product:', error);
        showErrorMessage('Failed to delete product: ' + error.message);
    }
}

/**
 * Handle product form submission
 */
async function handleAddProduct(event) {
    event.preventDefault();

    const productName = document.getElementById('productName').value;
    const productCategory = document.getElementById('productCategory').value;
    const productPrice = parseFloat(document.getElementById('productPrice').value);
    const productStock = parseInt(document.getElementById('productStock').value);
    const productImage = document.getElementById('productImage').value;

    if (!productName || !productCategory || !productPrice || productStock < 0) {
        showErrorMessage('Please fill in all required fields');
        return;
    }

    try {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const productData = {
            name: productName,
            category: productCategory,
            price: productPrice,
            stock: productStock,
            image: productImage || 'https://images.unsplash.com/photo-1599599810694-e5f8c1d7b4b5?auto=format&fit=crop&w=800&q=80'
        };

        const response = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers,
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add product');
        }

        showSuccessMessage('Product added successfully!');
        document.getElementById('addProductForm').reset();
        
        // Reload products list and clear messages after 2 seconds
        setTimeout(() => {
            loadProductsList();
            hideMessages();
        }, 2000);
    } catch (error) {
        console.error('Error adding product:', error);
        showErrorMessage(error.message || 'Failed to add product. Please try again.');
    }
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
    const successMsg = document.getElementById('successMessage');
    const errorMsg = document.getElementById('errorMessage');
    
    successMsg.textContent = message || '✅ Product added successfully!';
    successMsg.style.display = 'block';
    errorMsg.style.display = 'none';
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    const errorMsg = document.getElementById('errorMessage');
    const successMsg = document.getElementById('successMessage');
    
    errorMsg.textContent = '❌ ' + message;
    errorMsg.style.display = 'block';
    successMsg.style.display = 'none';
}

/**
 * Hide all messages
 */
function hideMessages() {
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
}

/**
 * Go back function
 */
function goBack() {
    window.history.back();
}

/**
 * Logout function
 */
function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    window.location.href = 'admin-login.html';
}


// Auto-refresh data while analytics view is active
function startAutoRefresh() {
    if (autoRefreshTimer) {
        return;
    }

    autoRefreshTimer = setInterval(() => {
        const analyticsView = document.getElementById('analyticsView');
        if (document.hidden || !analyticsView || !analyticsView.classList.contains('active')) {
            return;
        }
        loadDashboardData();
    }, REALTIME_REFRESH_MS);
}

function stopAutoRefresh() {
    if (!autoRefreshTimer) {
        return;
    }
    clearInterval(autoRefreshTimer);
    autoRefreshTimer = null;
}

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        const analyticsView = document.getElementById('analyticsView');
        if (analyticsView && analyticsView.classList.contains('active')) {
            loadDashboardData(true);
        }
    }
});
