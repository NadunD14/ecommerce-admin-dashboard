// src/models/index.js
const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Setting = require('./Setting');

// Define Associations

// Product belongs to Category
Product.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category',
});
Category.hasMany(Product, {
    foreignKey: 'categoryId',
    as: 'products',
});

// Order belongs to User
Order.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
});
User.hasMany(Order, {
    foreignKey: 'userId',
    as: 'orders',
});

// OrderItem belongs to Order
OrderItem.belongsTo(Order, {
    foreignKey: 'orderId',
    as: 'order',
});
Order.hasMany(OrderItem, {
    foreignKey: 'orderId',
    as: 'orderItems',
});

// OrderItem belongs to Product
OrderItem.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product',
});
Product.hasMany(OrderItem, {
    foreignKey: 'productId',
    as: 'orderItems',
});

module.exports = {
    sequelize,
    User,
    Category,
    Product,
    Order,
    OrderItem,
    Setting,
};
