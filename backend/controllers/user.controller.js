const User = require('../models/User');
const { ApiError, ValidationError, NotFoundError } = require('../error/errors');

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