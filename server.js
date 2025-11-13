// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, User } = require('./src/models/inedx');
const authController = require('./src/controllers/authcontroller');
const authMiddleware = require('./src/middleware/authMiddleware');
const roleMiddleware = require('./src/middleware/roleMiddleware');
const { initAdmin } = require('./src/config/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Global CORS first
app.use(cors()); // CORS handles preflight automatically for OPTIONS

// AdminJS authentication function
const authenticate = async (email, password) => {
    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return null;
        }

        const isValidPassword = await user.validPassword(password);

        if (!isValidPassword) {
            return null;
        }

        return {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        };
    } catch (error) {
        console.error('Authentication error:', error);
        return null;
    }
};

// We'll set up AdminJS, body parsers, and routes inside startServer to ensure correct ordering

// Initialize database and create default admin user
const initializeDatabase = async () => {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('✓ Database connection established successfully');

        // Sync database (creates tables if they don't exist)
        await sequelize.sync({ alter: true });
        console.log('✓ Database synchronized');

        // Create default admin user if not exists
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'securepassword123';

        const [adminUser, created] = await User.findOrCreate({
            where: { email: adminEmail },
            defaults: {
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
                name: 'Admin User',
            },
        });

        if (created) {
            console.log(`✓ Default admin user created: ${adminEmail}`);
        } else {
            console.log(`✓ Admin user already exists: ${adminEmail}`);
        }

        return true;
    } catch (error) {
        console.error('✗ Database initialization error:', error);
        return false;
    }
};

// Start server
const startServer = async () => {
    const dbInitialized = await initializeDatabase();

    if (!dbInitialized) {
        console.error('Failed to initialize database. Exiting...');
        process.exit(1);
    }

    // Initialize AdminJS (must come BEFORE body parsers)
    const { adminJs, adminRouter } = await initAdmin(authenticate);
    app.use(adminJs.options.rootPath, adminRouter);

    // Body parsers come AFTER AdminJS
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Public routes
    app.get('/', (req, res) => {
        res.json({
            message: 'E-Commerce Admin Dashboard API',
            endpoints: {
                login: 'POST /api/login',
                admin: 'GET /admin',
                verifyToken: 'GET /api/verify',
            },
        });
    });

    // Authentication routes
    app.post('/api/login', authController.login);
    app.get('/api/verify', authMiddleware, authController.verifyToken);

    // Example protected route (admin only)
    app.get('/api/admin/stats', authMiddleware, roleMiddleware('admin'), async (req, res) => {
        try {
            const totalUsers = await User.count();
            res.json({
                message: 'Admin statistics',
                stats: { totalUsers },
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.listen(PORT, () => {
        console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
        console.log(`📊 AdminJS dashboard: http://localhost:${PORT}${adminJs.options.rootPath}`);
        console.log(`\nDefault admin credentials:`);
        console.log(`  Email: ${process.env.ADMIN_EMAIL || 'admin@example.com'}`);
        console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'securepassword123'}`);
    });
};

startServer();
