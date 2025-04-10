const { ForbiddenError } = require('../error/errors');

const isAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new ForbiddenError('Authentication required but user not found on request.'));
  }

  if (req.user.role === 'admin') {
    next();
  } else {
    return next(new ForbiddenError('Access denied. Administrator privileges required.'));
  }
};

module.exports = { isAdmin };