// src/middleware/roleMiddleware.js

// Middleware to check if user has required role(s)
const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            // Check if user is authenticated (should be set by authMiddleware)
            if (!req.user) {
                return res.status(401).json({
                    error: 'Authentication required'
                });
            }

            // Check if user's role is in the allowed roles
            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    error: 'Access forbidden: insufficient permissions'
                });
            }

            next();
        } catch (error) {
            console.error('Role middleware error:', error);
            return res.status(500).json({
                error: 'Internal server error'
            });
        }
    };
};

module.exports = roleMiddleware;
