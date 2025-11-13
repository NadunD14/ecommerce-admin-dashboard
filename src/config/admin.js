// src/config/admin.js
const AdminJSExpress = require('@adminjs/express');
const AdminJSSequelize = require('@adminjs/sequelize');
const { User, Category, Product, Order, OrderItem, Setting } = require('../models/inedx');

// Initialize AdminJS using dynamic import (ESM compatible)
const initAdmin = async (authenticate) => {
    const { default: AdminJS } = await import('adminjs');

    // Register the Sequelize adapter
    AdminJS.registerAdapter(AdminJSSequelize);

    // AdminJS configuration
    const adminJs = new AdminJS({
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
                    isVisible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin',
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
                            reference: 'Category',
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
                            reference: 'User',
                        },
                    },
                    // All authenticated users can access orders
                    isAccessible: ({ currentAdmin }) => !!currentAdmin,
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
                            reference: 'Order',
                        },
                        productId: {
                            reference: 'Product',
                        },
                    },
                    // All authenticated users can access order items
                    isAccessible: ({ currentAdmin }) => !!currentAdmin,
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
                    isVisible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin',
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

                // Fetch summary statistics (safe to compute even if not logged in)
                const [totalUsers, totalProducts, totalOrders, totalCategories] = await Promise.all([
                    User.count(),
                    Product.count(),
                    Order.count(),
                    Category.count(),
                ]);

                const role = currentAdmin?.role || 'guest';
                const email = currentAdmin?.email || null;

                // Return dashboard data based on role (handle unauthenticated safely)
                return {
                    message:
                        role === 'admin'
                            ? 'Welcome Admin! You have full access to all resources.'
                            : email
                            ? `Welcome ${email}! You have access to products and orders.`
                            : 'Welcome! Please log in to access the admin panel.',
                    stats: {
                        totalUsers: role === 'admin' ? totalUsers : null,
                        totalProducts,
                        totalOrders,
                        totalCategories,
                    },
                    role,
                    email,
                };
            },
        },
    });

    // Build the router with authentication
    const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
        adminJs,
        {
            authenticate,
            cookiePassword: process.env.JWT_SECRET,
        },
        null,
        {
            resave: false,
            saveUninitialized: false,
            secret: process.env.JWT_SECRET,
        }
    );

    return { adminJs, adminRouter };
};

module.exports = { initAdmin };
