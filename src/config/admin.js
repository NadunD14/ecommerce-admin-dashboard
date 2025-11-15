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

// Initialize Component Loader
const componentLoader = new ComponentLoader();

// Add the InsightsDashboard component - use absolute path with explicit extension
const Components = {
    InsightsDashboard: componentLoader.add(
        'InsightsDashboard',
        path.join(__dirname, '../components/InsightsDashboard.jsx')
    ),
};

// Dashboard handler function to fetch summary data
const dashboardHandler = async (request, response, context) => {
    try {
        // Only allow admins to access dashboard data
        if (!context.currentAdmin || context.currentAdmin.role !== 'admin') {
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

const adminJs = new AdminJS({
    componentLoader,
    dashboard: {
        handler: dashboardHandler
    },
    pages: {
        insights: {
            label: 'Insights',
            icon: 'Analytics',
            component: Components.InsightsDashboard,
            isAccessible: ({ currentAdmin }) => !!currentAdmin,
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
                isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin',
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
                                request.payload.subtotal = 0;
                                request.payload.taxAmount = 0;
                                request.payload.totalAmount = 0;
                                if (!request.payload.orderDate) {
                                    request.payload.orderDate = new Date();
                                }
                                if (!request.payload.status) {
                                    request.payload.status = 'Pending';
                                }
                                if (context?.currentAdmin?.id) {
                                    request.payload.userId = context.currentAdmin.id;
                                }
                            }
                            return request;
                        },
                    },
                    edit: {
                        before: async (request) => {
                            if (request.payload) {
                                delete request.payload.totalAmount;
                                delete request.payload.subtotal;
                                delete request.payload.taxAmount;
                            }
                            return request;
                        },
                    },
                    delete: {
                        before: async (request) => {
                            if (request?.params?.recordId) {
                                await OrderItem.destroy({ where: { orderId: request.params.recordId } });
                            }
                            return request;
                        },
                    },
                    bulkDelete: {
                        before: async (request) => {
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

                                if (p.productId && (!p.unitPrice || p.unitPrice === '')) {
                                    const product = await Product.findByPk(p.productId);
                                    if (product) p.unitPrice = parseFloat(product.price);
                                } else if (p.unitPrice) {
                                    p.unitPrice = parseFloat(p.unitPrice);
                                }

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

                                if (p.productId && (!p.unitPrice || p.unitPrice === '')) {
                                    const product = await Product.findByPk(p.productId);
                                    if (product) p.unitPrice = parseFloat(product.price);
                                } else if (p.unitPrice) {
                                    p.unitPrice = parseFloat(p.unitPrice);
                                }

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
                isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin',
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
const SESSION_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const buildAdminRouter = (authenticate) => {
    return AdminJSExpress.buildAuthenticatedRouter(
        adminJs,
        {
            authenticate,
            cookiePassword: SESSION_SECRET,
            cookieName: 'adminjs',
        },
        null,
        {
            resave: false,
            saveUninitialized: false,
            secret: SESSION_SECRET,
            cookie: {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
            },
        }
    );
};

export { adminJs, buildAdminRouter };