// src/config/database.js
import { Sequelize } from 'sequelize';
import 'dotenv/config';

// Determine if we need SSL (for AWS RDS in production)
const isProduction = process.env.DB_HOST && !process.env.DB_HOST.includes('localhost');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: false, // Disable SQL query logging
        logQueryParameters: false, // Disable bound parameter logging
        benchmark: false, // Disable execution time logging
        dialectOptions: isProduction ? {
            ssl: {
                require: true,
                rejectUnauthorized: false, // For AWS RDS
            },
        } : {},
    }
);

export default sequelize;
