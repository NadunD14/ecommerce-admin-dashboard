// src/config/admin.js
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import AdminJSSequelize from '@adminjs/sequelize';
import { User, Category, Product, Order, OrderItem, Setting, sequelize } from '../models/inedx.js';
import { Components, componentLoader } from './components.js';

// Register the Sequelize adapter
AdminJS.registerAdapter(AdminJSSequelize);

// AdminJS configuration
const adminJs = new AdminJS({
    componentLoader,
    resources: [
        {
            resource: User,
            options: {
                navigation: {
                    name: 'User Management',
                    icon: 'User',
                },
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
            },
        },
        {
            resource: Category,
            options: {
                navigation: {
                    name: 'Products',
                    icon: 'ShoppingCart',
                },
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
                navigation: {
                    name: 'Products',
                    icon: 'ShoppingCart',
                },
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
                navigation: {
                    name: 'Orders',
                    icon: 'Package',
                },
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
                navigation: {
                    name: 'Orders',
                    icon: 'Package',
                },
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
                navigation: {
                    name: 'Configuration',
                    icon: 'Settings',
                },
                properties: {
                    id: {
                        isVisible: { list: true, show: true, edit: false, filter: true },
                    },
                },
                // Only admins can manage settings
                isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin',
            },
        },
    ],
    rootPath: '/admin',
    branding: {
        companyName: 'E-Commerce Admin',
        softwareBrothers: false,
    },
    dashboard: {
        component: Components.Dashboard,
        handler: async (request, response, context) => {
            const { currentAdmin } = context;

            // Fetch summary statistics
            const totalUsers = await User.count();
            const totalProducts = await Product.count();
            const totalOrders = await Order.count();
            const totalCategories = await Category.count();

            // Return dashboard data based on role
            return {
                message: currentAdmin.role === 'admin'
                    ? `Welcome Admin! You have full access to all resources.`
                    : `Welcome ${currentAdmin.email}! You have access to products and orders.`,
                stats: {
                    totalUsers: currentAdmin.role === 'admin' ? totalUsers : null,
                    totalProducts,
                    totalOrders,
                    totalCategories,
                },
                role: currentAdmin.role,
                email: currentAdmin.email,
            };
        },
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
