const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { UnauthorizedError } = require('../error/errors');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return next(new UnauthorizedError('No authentication token provided. Access denied.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return next(new UnauthorizedError('Invalid token: User not found.'));
    }

    req.user = user;
    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
         return next(new UnauthorizedError('Authentication token has expired. Please log in again.'));
    }
    return next(new UnauthorizedError('Invalid authentication token. Access denied.'));
  }
};

module.exports = { authenticateToken };