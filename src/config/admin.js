// src/config/admin.js
import AdminJS, { ComponentLoader } from 'adminjs';
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
