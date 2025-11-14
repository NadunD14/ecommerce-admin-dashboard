// src/models/OrderItem.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Order line item model
const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    // Order ID - FK to Order (hidden in AdminJS, auto-populated)
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    // Product - FK to Product
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    // Quantity - must be > 0
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
        },
    },
    // Unit Price - captured at time of order (read-only in AdminJS)
    unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    // Line Total = unitPrice * quantity (read-only in AdminJS)
    lineTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0,
        },
    },
}, {
    timestamps: true,
});

// Auto-calculate lineTotal if not provided
OrderItem.beforeValidate(async (item) => {
    const qty = Number(item.quantity || 0);
    const price = Number(item.unitPrice || 0);
    if ((item.lineTotal === undefined || item.lineTotal === null) && qty && price) {
        item.lineTotal = (qty * price).toFixed(2);
    }
});

// Recalculate Order.totalAmount when OrderItems change
async function recalcOrderTotal(orderId) {
    if (!orderId) return;
    const { OrderItem, Order, Setting } = sequelize.models;

    // Calculate subtotal from all line items
    const subtotal = await OrderItem.sum('lineTotal', { where: { orderId } }) || 0;

    // Get global tax rate from settings
    const taxRateSetting = await Setting.findOne({ where: { key: 'GLOBAL_TAX_RATE' } });
    const taxRate = taxRateSetting ? parseFloat(taxRateSetting.value) / 100 : 0;

    // Calculate tax and total
    const taxAmount = (subtotal * taxRate).toFixed(2);
    const totalAmount = (parseFloat(subtotal) + parseFloat(taxAmount)).toFixed(2);

    // Update order
    await Order.update({
        subtotal: subtotal.toFixed(2),
        taxAmount,
        totalAmount
    }, { where: { id: orderId } });
}

OrderItem.afterCreate(async (item) => {
    await recalcOrderTotal(item.orderId);
});

OrderItem.afterUpdate(async (item) => {
    await recalcOrderTotal(item.orderId);
});

OrderItem.afterDestroy(async (item) => {
    await recalcOrderTotal(item.orderId);
});

export default OrderItem;