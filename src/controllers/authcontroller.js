// src/controllers/authController.js
import jwt from 'jsonwebtoken';
import { User } from '../models/inedx.js';

const authController = {
    // Login endpoint
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validate input
            if (!email || !password) {
                return res.status(400).json({
                    error: 'Email and password are required'
                });
            }

            // Find user by email
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.status(401).json({
                    error: 'Invalid credentials'
                });
            }

            // Verify password
            const isValidPassword = await user.validPassword(password);

            if (!isValidPassword) {
                return res.status(401).json({
                    error: 'Invalid credentials'
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Send response
            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    name: user.name,
                },
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        }
    },

    // Verify token endpoint (optional)
    async verifyToken(req, res) {
        try {
            // Token is already verified by authMiddleware
            res.json({
                message: 'Token is valid',
                user: req.user,
            });
        } catch (error) {
            console.error('Token verification error:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        }
    },
};

export default authController;
