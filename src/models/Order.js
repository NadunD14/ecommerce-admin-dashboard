// src/models/Order.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Order header model (summary transaction)
const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    // User (Customer) - FK to User (optional for anonymous orders)
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    // Order Date - visible, defaults to now
    orderDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    // Status - enum
    status: {
        type: DataTypes.ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled'),
        allowNull: false,
        defaultValue: 'Pending',
    },
    // Shipping Address - free text (can later be split into structured fields)
    shippingAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    // Total Amount - calculated from line items + tax, read-only in AdminJS
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    },
    // Subtotal - before tax
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    },
    // Tax Amount - calculated from subtotal * tax rate
    taxAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    },
    // Payment Method - enum
    paymentMethod: {
        type: DataTypes.ENUM('Credit Card', 'PayPal', 'Cash on Delivery'),
        allowNull: true,
    },
    // Tracking Number - optional
    trackingNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
});

export default Order;

