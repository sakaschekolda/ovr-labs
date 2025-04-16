const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  ApiError,
  ValidationError,
  UnauthorizedError,
} = require('../error/errors');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError({
        credentials: 'Email and password are required.',
      });
    }

    const user = await User.scope('withPassword').findOne({ where: { email } });

    if (!user) {
      return next(new UnauthorizedError('Invalid email or password.'));
    }

    if (!user.password) {
      console.warn(
        `Login attempt for user ${email} failed: No password hash found in DB.`,
      );
      return next(new UnauthorizedError('Invalid email or password.'));
    }

    const isValid = await user.validPassword(password);

    if (!isValid) {
      return next(new UnauthorizedError('Invalid email or password.'));
    }

    const payload = {
      id: user.id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });

    res.status(200).json({
      message: 'Login successful!',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof UnauthorizedError
    ) {
      return next(error);
    }
    console.error('Unexpected error during login:', error);
    next(error);
  }
};
