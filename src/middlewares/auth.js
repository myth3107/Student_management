const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';


async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];
        let payload;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        const user = await User.findById(payload.id).select('-password').lean();
        if (!user) return res.status(401).json({ message: 'User not found' });

        // attach user to request
        req.user = { id: user._id.toString(), role: user.role, name: user.name, email: user.email };
        next();
    } catch (err) {
        console.error('authMiddleware error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// roles: array of allowed roles e.g. ['admin']
function roleMiddleware(roles = []) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: 'Authentication required' });
        if (!Array.isArray(roles) || roles.length === 0) return next(); // no restriction
        if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
        next();
    };
}

// Ownership helpers

// Simple check: compare req.params[paramName] to req.user.id
function ownershipByParam(paramName = 'id') {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: 'Authentication required' });
        const ownerId = req.params[paramName];
        if (!ownerId) return res.status(400).json({ message: 'Missing resource identifier' });
        if (ownerId.toString() !== req.user.id.toString()) return res.status(403).json({ message: 'Forbidden: not owner' });
        next();
    };
}

// Document ownership check: provide a Mongoose model and param name that contains doc id,
// and the field name on the document that references the owner (ownerField)
function ownershipByDocument(Model, docIdParam = 'id', ownerField = 'user') {
    return async (req, res, next) => {
        try {
            if (!req.user) return res.status(401).json({ message: 'Authentication required' });
            const docId = req.params[docIdParam];
            if (!docId) return res.status(400).json({ message: 'Missing resource identifier' });

            const doc = await Model.findById(docId).lean();
            if (!doc) return res.status(404).json({ message: 'Resource not found' });

            const ownerId = (doc[ownerField] && doc[ownerField].toString) ? doc[ownerField].toString() : doc[ownerField];
            if (!ownerId) return res.status(403).json({ message: 'Forbidden: owner not found on resource' });

            if (ownerId !== req.user.id.toString()) return res.status(403).json({ message: 'Forbidden: not owner' });

            // attach resource to request if caller wants it
            req.resource = doc;
            next();
        } catch (err) {
            console.error('ownershipByDocument error:', err);
            if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid resource id' });
            return res.status(500).json({ message: 'Internal server error' });
        }
    };
}

module.exports = {
    authMiddleware,
    roleMiddleware,
    ownershipByParam,
    ownershipByDocument
};