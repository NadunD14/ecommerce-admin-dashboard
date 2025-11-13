// src/models/index.js
import sequelize from '../config/database.js';
import User from './User.js';
import Category from './Category.js';
import Product from './Product.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Setting from './Setting.js';

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

export {
    sequelize,
    User,
    Category,
    Product,
    Order,
    OrderItem,
    Setting,
};
