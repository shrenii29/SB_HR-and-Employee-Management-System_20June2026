const jwt = require('jsonwebtoken');

// Middleware to verify if the user is logged in
const verifyToken = (req, res, next) => {
    // Get token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info (id, role) to the request object
        next(); // Move to the next function/route
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

// Middleware to verify if the user is an Admin
const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        next();
    });
};

module.exports = { verifyToken, verifyAdmin };