// src/models/Insights.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Insights = sequelize.define('Insights', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    // Insight type to categorize different kinds of insights
    type: {
        type: DataTypes.ENUM('total_orders', 'total_users', 'total_products', 'revenue', 'monthly_growth', 'weekly_growth'),
        allowNull: false,
    },
    // The actual insight value (numeric)
    value: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
    },
    // Additional metadata as JSON
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Additional data like date ranges, filters applied, etc.',
    },
    // Date when this insight was calculated
    calculatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    // Period this insight covers (daily, weekly, monthly, yearly, all-time)
    period: {
        type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly', 'all-time'),
        allowNull: false,
        defaultValue: 'all-time',
    },
    // Label for display purposes
    label: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // Description of what this insight represents
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    // Whether this insight is active/current
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['type', 'period'],
            name: 'insights_type_period_index',
        },
        {
            fields: ['calculatedAt'],
            name: 'insights_calculated_at_index',
        },
        {
            fields: ['isActive'],
            name: 'insights_active_index',
        },
    ],
});

// Static method to get current insights
Insights.getCurrentInsights = async function () {
    try {
        const insights = await this.findAll({
            where: {
                isActive: true,
                period: 'all-time'
            },
            order: [['calculatedAt', 'DESC']],
        });

        return insights;
    } catch (error) {
        console.error('Error fetching current insights:', error);
        return [];
    }
};

// Static method to update or create insights
Insights.updateInsight = async function (type, value, options = {}) {
    try {
        const {
            period = 'all-time',
            label,
            description,
            metadata = null
        } = options;

        // First, deactivate old insights of the same type and period
        await this.update(
            { isActive: false },
            {
                where: {
                    type,
                    period,
                    isActive: true
                }
            }
        );

        // Create new insight
        const insight = await this.create({
            type,
            value,
            period,
            label: label || type.replace('_', ' ').toUpperCase(),
            description,
            metadata,
            calculatedAt: new Date(),
            isActive: true
        });

        return insight;
    } catch (error) {
        console.error('Error updating insight:', error);
        throw error;
    }
};

// Static method to refresh all basic insights
Insights.refreshBasicInsights = async function () {
    try {
        // Import models dynamically to avoid circular dependencies
        const { default: User } = await import('./User.js');
        const { default: Product } = await import('./Product.js');
        const { default: Order } = await import('./Order.js');

        // Get counts
        const totalUsers = await User.count();
        const totalProducts = await Product.count();
        const totalOrders = await Order.count();

        // Update insights
        await this.updateInsight('total_users', totalUsers, {
            label: 'Total Users',
            description: 'Total number of registered users in the system'
        });

        await this.updateInsight('total_products', totalProducts, {
            label: 'Total Products',
            description: 'Total number of products in the catalog'
        });

        await this.updateInsight('total_orders', totalOrders, {
            label: 'Total Orders',
            description: 'Total number of orders placed'
        });

        console.log('Basic insights refreshed successfully');
        return true;
    } catch (error) {
        console.error('Error refreshing basic insights:', error);
        throw error;
    }
};

export default Insights;