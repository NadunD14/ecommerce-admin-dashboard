// src/controllers/insightsController.js
import { User, Product, Order } from '../models/inedx.js';

const insightsController = {
    // Get current insights directly from models
    async getCurrentInsights(req, res) {
        try {
            // Check if user is admin
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied. Admin privileges required.'
                });
            }

            // Get counts directly from models
            const [totalUsers, totalProducts, totalOrders] = await Promise.all([
                User.count(),
                Product.count(),
                Order.count()
            ]);

            // Calculate revenue (sum of all order totals)
            const revenue = await Order.sum('totalAmount') || 0;

            const insightsData = {
                total_users: {
                    value: totalUsers,
                    label: 'Total Users',
                    description: 'Total number of registered users in the system',
                    calculatedAt: new Date(),
                    period: 'all-time'
                },
                total_products: {
                    value: totalProducts,
                    label: 'Total Products',
                    description: 'Total number of products in the catalog',
                    calculatedAt: new Date(),
                    period: 'all-time'
                },
                total_orders: {
                    value: totalOrders,
                    label: 'Total Orders',
                    description: 'Total number of orders placed',
                    calculatedAt: new Date(),
                    period: 'all-time'
                },
                revenue: {
                    value: revenue,
                    label: 'Total Revenue',
                    description: 'Total revenue from all orders',
                    calculatedAt: new Date(),
                    period: 'all-time'
                }
            };

            res.json({
                success: true,
                data: insightsData,
                totalInsights: Object.keys(insightsData).length
            });
        } catch (error) {
            console.error('Error fetching insights:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch insights'
            });
        }
    },

    // Refresh basic insights (no longer needed since we get real-time data)
    async refreshBasicInsights(req, res) {
        try {
            res.json({
                success: true,
                message: 'Insights are now calculated in real-time - no refresh needed'
            });
        } catch (error) {
            console.error('Error refreshing insights:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to refresh insights'
            });
        }
    },

    // Get insights summary for dashboard
    async getInsightsSummary(req, res) {
        try {
            // Check if user is admin
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied. Admin privileges required.'
                });
            }

            // Get counts directly from models
            const [totalUsers, totalProducts, totalOrders] = await Promise.all([
                User.count(),
                Product.count(),
                Order.count()
            ]);

            // Calculate revenue (sum of all order totals)
            const revenue = await Order.sum('totalAmount') || 0;

            const summary = {
                totalOrders,
                totalUsers,
                totalProducts,
                revenue: parseFloat(revenue)
            };

            res.json({
                success: true,
                data: summary
            });
        } catch (error) {
            console.error('Error fetching insights summary:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch insights summary'
            });
        }
    }
};

export default insightsController;