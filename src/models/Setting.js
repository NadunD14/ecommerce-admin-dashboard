// src/models/Setting.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Setting = sequelize.define('Setting', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    type: {
        type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
        defaultValue: 'string',
    },
}, {
    timestamps: true,
});

export default Setting;

// When GLOBAL_TAX_RATE changes, recompute tax/total for all orders based on current subtotal
Setting.afterCreate(async (setting) => {
    if (setting.key === 'GLOBAL_TAX_RATE') {
        await recomputeAllOrdersTax(setting.value);
    }
});

Setting.afterUpdate(async (setting) => {
    if (setting.key === 'GLOBAL_TAX_RATE') {
        await recomputeAllOrdersTax(setting.value);
    }
});

async function recomputeAllOrdersTax(rawRate) {
    const rate = isNaN(parseFloat(rawRate)) ? 0 : parseFloat(rawRate) / 100;
    const { Order } = sequelize.models;
    if (!Order) return;
    // Fetch orders in batches if needed; for simplicity, update all
    const orders = await Order.findAll({ attributes: ['id', 'subtotal'] });
    for (const ord of orders) {
        const subtotalNum = parseFloat(ord.subtotal || 0) || 0;
        const taxAmount = (subtotalNum * rate).toFixed(2);
        const totalAmount = (subtotalNum + parseFloat(taxAmount)).toFixed(2);
        await Order.update({ taxAmount, totalAmount }, { where: { id: ord.id } });
    }
}
