const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token = req.header('Authorization');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length).trimLeft();
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ msg: 'Admin authorization required' });
    }
};

const teacherOnly = (req, res, next) => {
    if (req.user && req.user.role === 'Teacher') {
        next();
    } else {
        res.status(403).json({ msg: 'Teacher authorization required' });
    }
};

module.exports = { protect, adminOnly, teacherOnly };
