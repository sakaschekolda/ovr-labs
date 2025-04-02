const User = require('../models/User');
const { ApiError, ValidationError } = require('../error/errors');

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const validationErrors = {};
    if (!name) validationErrors.name = 'Name is required';
    if (!email) {
      validationErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
       validationErrors.email = 'Invalid email format';
    }

    if (Object.keys(validationErrors).length > 0) {
        throw new ValidationError(validationErrors, 'User creation failed validation.');
    }

    const user = await User.create({ name, email, password: password || null });

    res.status(201).json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const errors = {};
        error.errors.forEach(err => { errors[err.path] = err.message; });
        return next(new ValidationError(errors, 'User creation failed database validation.'));
    }
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({ order: [['created_at', 'DESC']] });

    res.status(200).json({
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};