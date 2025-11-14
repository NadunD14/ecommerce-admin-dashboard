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

// AdminJS configuration
// Register custom components
const componentLoader = new ComponentLoader();
const DashboardComponent = componentLoader.add('Dashboard', path.join(__dirname, './dashboard.jsx'));

const adminJs = new AdminJS({
    componentLoader,
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
                filterProperties: ['userId', 'status', 'orderDate'],
                actions: {
                    new: {
                        before: async (request) => {
                            if (request.payload) {
                                // Prevent manual override of calculated fields
                                delete request.payload.totalAmount;
                                delete request.payload.subtotal;
                                delete request.payload.taxAmount;
                                // Set orderDate to now if not provided
                                if (!request.payload.orderDate) {
                                    request.payload.orderDate = new Date();
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
    dashboard: {
        handler: async (request, response, context) => {
            const { currentAdmin } = context;

            // Fetch summary statistics
            const totalUsers = await User.count();
            const totalProducts = await Product.count();
            const totalOrders = await Order.count();
            const totalCategories = await Category.count();

            // Calculate total revenue from all orders
            const orders = await Order.findAll({
                attributes: ['totalAmount'],
            });
            const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);

            if (currentAdmin.role === 'admin') {
                // Admin Dashboard: System Summary with full metrics

                // System metrics (only for admin)
                const serverUptime = process.uptime();

                // Memory usage
                const memUsage = process.memoryUsage();
                const totalMemory = memUsage.heapTotal / 1024 / 1024; // MB
                const usedMemory = memUsage.heapUsed / 1024 / 1024; // MB

                // Database uptime check
                let dbUptime = null;
                let dbConnected = false;
                try {
                    await sequelize.authenticate();
                    dbConnected = true;
                    // Try to get database uptime (PostgreSQL specific)
                    const [results] = await sequelize.query(
                        "SELECT EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time())) as uptime"
                    );
                    if (results && results[0]) {
                        dbUptime = Math.floor(results[0].uptime);
                    }
                } catch (error) {
                    dbConnected = false;
                }

                const systemMetrics = {
                    serverUptime: Math.floor(serverUptime),
                    memoryUsage: {
                        total: totalMemory.toFixed(2),
                        used: usedMemory.toFixed(2),
                        percentage: ((usedMemory / totalMemory) * 100).toFixed(2),
                    },
                    database: {
                        connected: dbConnected,
                        uptime: dbUptime,
                    },
                    nodeVersion: process.version,
                    platform: process.platform,
                };

                return {
                    message: `Welcome Admin! You have full access to all resources and system metrics.`,
                    dashboardType: 'admin',
                    stats: {
                        totalUsers,
                        totalProducts,
                        totalOrders,
                        totalCategories,
                        totalRevenue: totalRevenue.toFixed(2),
                    },
                    systemMetrics,
                    role: currentAdmin.role,
                    email: currentAdmin.email,
                };
            } else {
                // Regular User Dashboard: Limited Dashboard with personal/activity focus

                // Get recent orders (last 10)
                const recentOrders = await Order.findAll({
                    limit: 10,
                    order: [['createdAt', 'DESC']],
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['email', 'name'],
                        }
                    ],
                });

                // Get recent activity stats
                const todaysOrders = await Order.count({
                    where: {
                        createdAt: {
                            [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
                        }
                    }
                });

                const thisWeekOrders = await Order.count({
                    where: {
                        createdAt: {
                            [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        }
                    }
                });

                return {
                    message: `Welcome ${currentAdmin.email}! You can manage products, categories, orders, and order items.`,
                    dashboardType: 'regular',
                    stats: {
                        totalProducts,
                        totalOrders,
                        totalCategories,
                        todaysOrders,
                        thisWeekOrders,
                    },
                    recentOrders: recentOrders.map(order => ({
                        id: order.id,
                        totalAmount: order.totalAmount,
                        status: order.status,
                        createdAt: order.createdAt,
                        customerEmail: order.user?.email,
                        customerName: order.user?.name,
                    })),
                    role: currentAdmin.role,
                    email: currentAdmin.email,
                };
            }
        },
        // Attach a custom React component for the dashboard UI
        component: DashboardComponent,
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
