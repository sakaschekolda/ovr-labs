const User = require('../models/User');
const { ApiError, ValidationError, NotFoundError } = require('../error/errors');

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

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ValidationError({ email: 'Email address is already in use.' });
    }

    const user = await User.create({ name, email, password: password || null });

    const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at
    };

    res.status(201).json({
      data: userData
    });
  } catch (error) {
    if (error instanceof ValidationError) {
        return next(error);
    }
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const errors = {};
        error.errors.forEach(err => { errors[err.path] = err.message; });
        const message = error.name === 'SequelizeUniqueConstraintError' ? 'Database constraint violation.' : 'User creation failed database validation.';
        return next(new ValidationError(errors, message));
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

exports.changeUserRole = async (req, res, next) => {
    try {
        const userIdToChange = req.params.id;
        const { role: newRole } = req.body;

        if (isNaN(parseInt(userIdToChange))) {
            throw new ValidationError({ id: "User ID in URL must be an integer." });
        }

        if (!newRole || !['user', 'admin'].includes(newRole)) {
            throw new ValidationError({ role: "Invalid role specified. Must be 'user' or 'admin'." });
        }

        const userToChange = await User.findByPk(userIdToChange);

        if (!userToChange) {
            throw new NotFoundError('User');
        }

        userToChange.role = newRole;
        await userToChange.save({ fields: ['role'] });

        const updatedUser = await User.findByPk(userIdToChange);

         res.status(200).json({
            message: "User role updated successfully.",
            user: updatedUser
        });

    } catch (error) {
        next(error);
    }
};