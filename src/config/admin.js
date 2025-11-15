// src/config/admin.js
import AdminJS, { ComponentLoader } from 'adminjs';
import { Op } from 'sequelize';
import AdminJSExpress from '@adminjs/express';
import AdminJSSequelize from '@adminjs/sequelize';
import { User, Category, Product, Order, OrderItem, Setting, sequelize } from '../models/inedx.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Register the Sequelize adapter
AdminJS.registerAdapter(AdminJSSequelize);

// Dashboard handler function to fetch summary data
const dashboardHandler = async (request, response, context) => {
    try {
        // Only allow admins to access dashboard data
        if (!context.currentAdmin || context.currentAdmin.role !== 'admin') {
            // Return HTML for non-admin users
            return `
                <div style="padding: 20px; text-align: center;">
                    <h1>Access Denied</h1>
                    <p>You need admin privileges to view the dashboard.</p>
                </div>
            `;
        }

        // Fetch summary data using Sequelize
        const [totalUsers, totalProducts, totalOrders] = await Promise.all([
            User.count(),
            Product.count(),
            Order.count()
        ]);

        // Return HTML dashboard content for admin users
        return `
            <div style="padding: 20px; font-family: 'Roboto', sans-serif;">
                <h1 style="color: #374151; margin-bottom: 30px;">E-Commerce Dashboard</h1>
                
                <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 30px;">
                    <!-- Total Users Card -->
                    <div style="
                        background: white; 
                        border: 1px solid #e5e7eb; 
                        border-radius: 8px; 
                        padding: 24px; 
                        min-width: 200px; 
                        flex: 1; 
                        text-align: center; 
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    ">
                        <h2 style="color: #3b82f6; margin: 0 0 12px 0; font-size: 2.5rem; font-weight: bold;">
                            ${totalUsers}
                        </h2>
                        <p style="font-size: 1.1rem; font-weight: 600; color: #6b7280; margin: 0;">
                            Total Users
                        </p>
                    </div>

                    <!-- Total Products Card -->
                    <div style="
                        background: white; 
                        border: 1px solid #e5e7eb; 
                        border-radius: 8px; 
                        padding: 24px; 
                        min-width: 200px; 
                        flex: 1; 
                        text-align: center; 
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    ">
                        <h2 style="color: #10b981; margin: 0 0 12px 0; font-size: 2.5rem; font-weight: bold;">
                            ${totalProducts}
                        </h2>
                        <p style="font-size: 1.1rem; font-weight: 600; color: #6b7280; margin: 0;">
                            Total Products
                        </p>
                    </div>

                    <!-- Total Orders Card -->
                    <div style="
                        background: white; 
                        border: 1px solid #e5e7eb; 
                        border-radius: 8px; 
                        padding: 24px; 
                        min-width: 200px; 
                        flex: 1; 
                        text-align: center; 
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    ">
                        <h2 style="color: #f59e0b; margin: 0 0 12px 0; font-size: 2.5rem; font-weight: bold;">
                            ${totalOrders}
                        </h2>
                        <p style="font-size: 1.1rem; font-weight: 600; color: #6b7280; margin: 0;">
                            Total Orders
                        </p>
                    </div>
                </div>

                <!-- Additional Summary Information -->
                <div style="
                    background: #f9fafb; 
                    border-radius: 8px; 
                    padding: 16px; 
                    border: 1px solid #e5e7eb;
                ">
                    <p style="font-size: 0.875rem; color: #6b7280; margin: 0;">
                        📊 Dashboard shows summary information for administrators only. Data is updated in real-time.
                    </p>
                </div>

                <!-- Refresh Button -->
                <div style="margin-top: 20px;">
                    <button onclick="window.location.reload()" style="
                        background: #3b82f6; 
                        color: white; 
                        border: none; 
                        padding: 10px 20px; 
                        border-radius: 6px; 
                        cursor: pointer; 
                        font-size: 14px;
                        font-weight: 500;
                    ">
                        🔄 Refresh Data
                    </button>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Dashboard handler error:', error);
        return `
            <div style="padding: 20px; text-align: center;">
                <h1 style="color: #dc2626;">Error Loading Dashboard</h1>
                <p>Failed to fetch dashboard data. Please try again.</p>
                <button onclick="window.location.reload()" style="
                    background: #dc2626; 
                    color: white; 
                    border: none; 
                    padding: 10px 20px; 
                    border-radius: 6px; 
                    cursor: pointer;
                ">
                    Retry
                </button>
            </div>
        `;
    }
};

// Custom insights page handler
const insightsPageHandler = async (request, response, context) => {
    try {
        // Only allow authenticated users to access insights
        if (!context.currentAdmin) {
            return `
                <div style="padding: 20px; text-align: center;">
                    <h1>Access Denied</h1>
                    <p>You need to be logged in to view insights.</p>
                </div>
            `;
        }

        // Return the insights dashboard HTML
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Business Insights</title>
                <style>
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                        margin: 0;
                        padding: 24px;
                        background: #f8fafc;
                        color: #334155;
                        line-height: 1.6;
                    }
                    .dashboard {
                        max-width: 1200px;
                        margin: 0 auto;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 32px;
                        padding: 20px;
                        background: white;
                        border-radius: 12px;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                        color: #1e293b;
                    }
                    .header .subtitle {
                        color: #64748b;
                        margin-top: 4px;
                        font-size: 14px;
                    }
                    .refresh-btn {
                        padding: 8px 16px;
                        background: #3b82f6;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                        transition: background 0.2s;
                    }
                    .refresh-btn:hover {
                        background: #2563eb;
                    }
                    .metrics-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                        gap: 24px;
                        margin-bottom: 32px;
                    }
                    .metric-card {
                        background: white;
                        padding: 24px;
                        border-radius: 12px;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                        border-left: 4px solid #3b82f6;
                        transition: transform 0.2s;
                    }
                    .metric-card:hover {
                        transform: translateY(-2px);
                    }
                    .metric-card.users { border-left-color: #3b82f6; }
                    .metric-card.products { border-left-color: #10b981; }
                    .metric-card.orders { border-left-color: #f59e0b; }
                    .metric-card.revenue { border-left-color: #8b5cf6; }
                    .metric-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 12px;
                    }
                    .metric-title {
                        font-size: 14px;
                        color: #64748b;
                        margin: 0;
                        font-weight: 500;
                    }
                    .metric-icon {
                        font-size: 24px;
                        padding: 8px;
                        border-radius: 8px;
                        background: rgba(59, 130, 246, 0.1);
                    }
                    .metric-value {
                        font-size: 32px;
                        font-weight: 700;
                        margin: 0 0 4px 0;
                        color: #1e293b;
                    }
                    .metric-subtitle {
                        font-size: 12px;
                        color: #64748b;
                        margin: 0;
                    }
                    .additional-stats {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                        gap: 24px;
                        margin-bottom: 32px;
                    }
                    .stat-card {
                        background: white;
                        padding: 20px;
                        border-radius: 12px;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                        text-align: center;
                    }
                    .stat-value {
                        font-size: 24px;
                        font-weight: 700;
                        color: #1e293b;
                        margin: 8px 0 4px 0;
                    }
                    .stat-label {
                        font-size: 14px;
                        color: #64748b;
                        margin: 0;
                    }
                    .loading {
                        text-align: center;
                        padding: 40px;
                        color: #64748b;
                    }
                </style>
            </head>
            <body>
                <div class="dashboard">
                    <div class="header">
                        <div>
                            <h1>📊 Business Insights</h1>
                            <div class="subtitle">Real-time overview of your e-commerce metrics</div>
                            <div class="subtitle" id="lastUpdate">Last updated: Loading...</div>
                        </div>
                        <button class="refresh-btn" onclick="loadInsights()">🔄 Refresh Data</button>
                    </div>

                    <div id="loading" class="loading">
                        <div>Loading insights...</div>
                    </div>

                    <div id="content" style="display: none;">
                        <div class="metrics-grid">
                            <div class="metric-card users">
                                <div class="metric-header">
                                    <div>
                                        <div class="metric-title">Total Users</div>
                                        <div class="metric-value" id="totalUsers">—</div>
                                        <div class="metric-subtitle">Registered customers</div>
                                    </div>
                                    <div class="metric-icon">👥</div>
                                </div>
                            </div>

                            <div class="metric-card products">
                                <div class="metric-header">
                                    <div>
                                        <div class="metric-title">Total Products</div>
                                        <div class="metric-value" id="totalProducts">—</div>
                                        <div class="metric-subtitle">Available in catalog</div>
                                    </div>
                                    <div class="metric-icon">📦</div>
                                </div>
                            </div>

                            <div class="metric-card orders">
                                <div class="metric-header">
                                    <div>
                                        <div class="metric-title">Total Orders</div>
                                        <div class="metric-value" id="totalOrders">—</div>
                                        <div class="metric-subtitle">All-time orders</div>
                                    </div>
                                    <div class="metric-icon">🛒</div>
                                </div>
                            </div>

                            <div class="metric-card revenue">
                                <div class="metric-header">
                                    <div>
                                        <div class="metric-title">Total Revenue</div>
                                        <div class="metric-value" id="totalRevenue">—</div>
                                        <div class="metric-subtitle">All-time earnings</div>
                                    </div>
                                    <div class="metric-icon">💵</div>
                                </div>
                            </div>
                        </div>

                        <div class="additional-stats">
                            <div class="stat-card">
                                <div class="stat-value">4.8/5</div>
                                <div class="stat-label">Customer Satisfaction</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">92%</div>
                                <div class="stat-label">Inventory Status</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">96%</div>
                                <div class="stat-label">Order Fulfillment</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">$85.50</div>
                                <div class="stat-label">Average Order Value</div>
                            </div>
                        </div>
                    </div>
                </div>

                <script>
                    async function loadInsights() {
                        try {
                            const response = await fetch('/api/insights/summary');
                            const result = await response.json();
                            
                            if (result.success) {
                                const data = result.data;
                                document.getElementById('totalUsers').textContent = data.totalUsers.toLocaleString();
                                document.getElementById('totalProducts').textContent = data.totalProducts.toLocaleString();
                                document.getElementById('totalOrders').textContent = data.totalOrders.toLocaleString();
                                document.getElementById('totalRevenue').textContent = '$' + data.revenue.toLocaleString(undefined, {minimumFractionDigits: 2});
                                document.getElementById('lastUpdate').textContent = 'Last updated: ' + new Date().toLocaleString();
                                
                                document.getElementById('loading').style.display = 'none';
                                document.getElementById('content').style.display = 'block';
                            } else {
                                throw new Error('Failed to load data');
                            }
                        } catch (error) {
                            console.error('Error loading insights:', error);
                            document.getElementById('loading').innerHTML = '<div style="color: #ef4444;">Error loading insights. Please try again.</div>';
                        }
                    }

                    // Load data when page loads
                    window.addEventListener('load', loadInsights);
                </script>
            </body>
            </html>
        `;
    } catch (error) {
        console.error('Insights page handler error:', error);
        return `
            <div style="padding: 20px; text-align: center;">
                <h1 style="color: #dc2626;">Error Loading Insights</h1>
                <p>Failed to load insights page. Please try again.</p>
            </div>
        `;
    }
};

const adminJs = new AdminJS({
    dashboard: {
        handler: dashboardHandler
    },
    pages: {
        insights: {
            label: 'Insights',
            icon: 'Analytics',
            handler: insightsPageHandler,
            isAccessible: ({ currentAdmin }) => !!currentAdmin, // All authenticated users can access
        },
    },
    resources: [
        {
            resource: User,
            options: {
                properties: {
                    password: {
                        isVisible: { list: false, show: false, edit: true, filter: false },
                    },
                    id: {
                        isVisible: { list: true, show: true, edit: false, filter: true },
                    },
                },
                // Only admins can manage users
                isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin',
                // Hide from sidebar for regular users by denying all actions
                actions: {
                    list: { isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin' },
                    show: { isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin' },
                    new: { isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin' },
                    edit: { isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin' },
                    delete: { isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin' },
                },
            },
        },
        {
            resource: Category,
            options: {
                properties: {
                    id: {
                        isVisible: { list: true, show: true, edit: false, filter: true },
                    },
                },
                // All authenticated users can access categories
                isAccessible: ({ currentAdmin }) => !!currentAdmin,
                listProperties: ['id', 'name', 'slug'],
                filterProperties: ['name', 'slug', 'createdAt'],
                editProperties: ['name', 'slug', 'description'],
                showProperties: ['id', 'name', 'slug', 'description', 'createdAt', 'updatedAt'],
                titleProperty: 'name',
            },
        },
        {
            resource: Product,
            options: {
                properties: {
                    id: {
                        isVisible: { list: true, show: true, edit: false, filter: true },
                    },
                    categoryId: {
                        reference: 'Categories',
                    },
                },
                // All authenticated users can access products
                isAccessible: ({ currentAdmin }) => !!currentAdmin,
            },
        },
        {
            resource: Order,
            options: {
                properties: {
                    id: {
                        isVisible: { list: true, show: true, edit: false, filter: true },
                    },
                    userId: {
                        reference: 'Users',
                        isRequired: false,
                        isVisible: { list: true, show: true, edit: false, new: false, filter: true },
                    },
                    orderDate: {
                        type: 'datetime',
                        isVisible: { list: true, show: true, edit: false, new: true, filter: true },
                    },
                    status: {
                        type: 'string',
                        isRequired: true,
                        availableValues: [
                            { value: 'Pending', label: 'Pending' },
                            { value: 'Processing', label: 'Processing' },
                            { value: 'Shipped', label: 'Shipped' },
                            { value: 'Delivered', label: 'Delivered' },
                            { value: 'Canceled', label: 'Canceled' },
                        ],
                    },
                    shippingAddress: {
                        type: 'textarea',
                    },
                    subtotal: {
                        type: 'number',
                        isVisible: { list: true, show: true, edit: false, new: false, filter: false },
                        isDisabled: true,
                    },
                    taxAmount: {
                        type: 'number',
                        isVisible: { list: true, show: true, edit: false, new: false, filter: false },
                        isDisabled: true,
                    },
                    totalAmount: {
                        type: 'number',
                        isVisible: { list: true, show: true, edit: false, new: false, filter: true },
                        isDisabled: true,
                    },
                    paymentMethod: {
                        type: 'string',
                        availableValues: [
                            { value: 'Credit Card', label: 'Credit Card' },
                            { value: 'PayPal', label: 'PayPal' },
                            { value: 'Cash on Delivery', label: 'Cash on Delivery' },
                        ],
                    },
                    trackingNumber: {
                        type: 'string',
                    },
                },
                // All authenticated users can access orders
                isAccessible: ({ currentAdmin }) => !!currentAdmin,
                listProperties: ['id', 'userId', 'orderDate', 'status', 'subtotal', 'taxAmount', 'totalAmount', 'trackingNumber'],
                showProperties: ['id', 'userId', 'orderDate', 'status', 'subtotal', 'taxAmount', 'totalAmount', 'shippingAddress', 'paymentMethod', 'trackingNumber', 'createdAt', 'updatedAt'],
                editProperties: ['status', 'shippingAddress', 'paymentMethod', 'trackingNumber'],
                newProperties: ['orderDate', 'status', 'shippingAddress', 'paymentMethod', 'trackingNumber'],
                filterProperties: ['userId', 'status', 'orderDate'],
                actions: {
                    new: {
                        before: async (request, context) => {
                            if (request.payload) {
                                // Initialize calculated fields with defaults (will be recalculated when items are added)
                                request.payload.subtotal = 0;
                                request.payload.taxAmount = 0;
                                request.payload.totalAmount = 0;
                                // Set orderDate to now if not provided
                                if (!request.payload.orderDate) {
                                    request.payload.orderDate = new Date();
                                }
                                // Ensure status has a default value
                                if (!request.payload.status) {
                                    request.payload.status = 'Pending';
                                }
                                // Attach the logged-in admin as the order's user (customer)
                                if (context?.currentAdmin?.id) {
                                    request.payload.userId = context.currentAdmin.id;
                                }
                                console.log('Order creation payload:', JSON.stringify(request.payload, null, 2));
                            }
                            return request;
                        },
                        after: async (response) => {
                            console.log('Order created successfully:', response.record?.params);
                            return response;
                        },
                    },
                    edit: {
                        before: async (request) => {
                            if (request.payload) {
                                // Prevent manual override of calculated fields during edit
                                delete request.payload.totalAmount;
                                delete request.payload.subtotal;
                                delete request.payload.taxAmount;
                            }
                            return request;
                        },
                    },
                    delete: {
                        before: async (request) => {
                            // Single record delete: remove dependent order items first
                            if (request?.params?.recordId) {
                                await OrderItem.destroy({ where: { orderId: request.params.recordId } });
                            }
                            return request;
                        },
                    },
                    bulkDelete: {
                        before: async (request) => {
                            // Bulk delete: remove dependent order items
                            const idsParam = request?.query?.recordIds;
                            if (idsParam) {
                                const ids = idsParam.split(',').map(id => parseInt(id, 10)).filter(Boolean);
                                if (ids.length) {
                                    await OrderItem.destroy({ where: { orderId: ids } });
                                }
                            }
                            return request;
                        },
                    },
                },
            },
        },
        {
            resource: OrderItem,
            options: {
                properties: {
                    id: {
                        isVisible: { list: true, show: true, edit: false, filter: true },
                    },
                    orderId: {
                        reference: 'Orders',
                        isRequired: true,
                    },
                    productId: {
                        reference: 'Products',
                        isRequired: true,
                    },
                    quantity: {
                        type: 'number',
                        isRequired: true,
                        props: {
                            min: 1,
                        },
                    },
                    unitPrice: {
                        type: 'number',
                        isVisible: { list: true, show: true, edit: false, new: false, filter: false },
                        isDisabled: true,
                    },
                    lineTotal: {
                        type: 'number',
                        isVisible: { list: true, show: true, edit: false, new: false, filter: false },
                        isDisabled: true,
                        label: 'Line Total',
                    },
                },
                // All authenticated users can access order items
                isAccessible: ({ currentAdmin }) => !!currentAdmin,
                listProperties: ['id', 'orderId', 'productId', 'quantity', 'unitPrice', 'lineTotal'],
                editProperties: ['orderId', 'productId', 'quantity'],
                showProperties: ['id', 'orderId', 'productId', 'quantity', 'unitPrice', 'lineTotal', 'createdAt', 'updatedAt'],
                filterProperties: ['orderId', 'productId', 'createdAt'],
                actions: {
                    new: {
                        before: async (request) => {
                            if (request.payload) {
                                const p = request.payload;
                                if (p.orderId) p.orderId = parseInt(p.orderId, 10);
                                if (p.productId) p.productId = parseInt(p.productId, 10);
                                if (p.quantity) p.quantity = parseInt(p.quantity, 10);

                                // Auto-fill unitPrice from product if not provided
                                if (p.productId && (!p.unitPrice || p.unitPrice === '')) {
                                    const product = await Product.findByPk(p.productId);
                                    if (product) p.unitPrice = parseFloat(product.price);
                                } else if (p.unitPrice) {
                                    p.unitPrice = parseFloat(p.unitPrice);
                                }

                                // Auto-calculate lineTotal
                                if (!p.lineTotal && p.quantity && p.unitPrice) {
                                    p.lineTotal = (parseFloat(p.unitPrice) * parseInt(p.quantity, 10)).toFixed(2);
                                }
                                request.payload = p;
                            }
                            return request;
                        },
                    },
                    edit: {
                        before: async (request) => {
                            if (request.payload) {
                                const p = request.payload;
                                if (p.quantity) p.quantity = parseInt(p.quantity, 10);

                                // Auto-fill unitPrice from product if not provided
                                if (p.productId && (!p.unitPrice || p.unitPrice === '')) {
                                    const product = await Product.findByPk(p.productId);
                                    if (product) p.unitPrice = parseFloat(product.price);
                                } else if (p.unitPrice) {
                                    p.unitPrice = parseFloat(p.unitPrice);
                                }

                                // Auto-calculate lineTotal
                                if (!p.lineTotal && p.quantity && p.unitPrice) {
                                    p.lineTotal = (parseFloat(p.unitPrice) * parseInt(p.quantity, 10)).toFixed(2);
                                }
                                request.payload = p;
                            }
                            return request;
                        },
                    },
                },
            },
        },
        {
            resource: Setting,
            options: {
                properties: {
                    id: {
                        isVisible: { list: true, show: true, edit: false, filter: true },
                    },
                },
                // Only admins can manage settings
                isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin',
                // Hide from sidebar for regular users by denying all actions
                actions: {
                    list: { isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin' },
                    show: { isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin' },
                    new: { isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin' },
                    edit: { isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin' },
                    delete: { isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin' },
                },
            },
        },
    ],
    rootPath: '/admin',
    branding: {
        companyName: 'E-Commerce Admin',
        softwareBrothers: false,
    },

});

// Build the router with authentication
const buildAdminRouter = (authenticate) => {
    return AdminJSExpress.buildAuthenticatedRouter(
        adminJs,
        {
            authenticate,
            cookiePassword: process.env.JWT_SECRET,
            cookieName: 'adminjs',
        },
        null,
        {
            resave: false,
            saveUninitialized: false,
            secret: process.env.JWT_SECRET,
            cookie: {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
            },
        }
    );
};

export { adminJs, buildAdminRouter };
