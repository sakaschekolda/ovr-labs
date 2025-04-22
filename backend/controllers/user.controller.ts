import { Request, Response, NextFunction } from 'express';
import User, { UserRole } from '../models/User.js';
import { ValidationError, NotFoundError } from '../error/errors.js';
import 'dotenv/config';

interface GetAllUsersResponseBody {
    count: number;
    data: User[];
}

interface ChangeRoleParams {
    id: string;
}

interface ChangeRoleRequestBody {
    role?: UserRole;
}

interface ChangeRoleResponseBody {
    message: string;
    user: User;
}

export const getAllUsers = async (req: Request, res: Response<GetAllUsersResponseBody>, next: NextFunction): Promise<void> => {
  try {
    const users: User[] = await User.findAll({ order: [['created_at', 'DESC']] });

    res.status(200).json({
      count: users.length,
      data: users
    });
  } catch (error: unknown) {
    next(error);
  }
};

export const changeUserRole = async (req: Request<ChangeRoleParams, ChangeRoleResponseBody, ChangeRoleRequestBody>, res: Response<ChangeRoleResponseBody>, next: NextFunction): Promise<void> => {
    try {
        const userIdToChangeString = req.params.id;
        const userIdToChange = parseInt(userIdToChangeString, 10);
        const { role: newRole } = req.body;

        if (isNaN(userIdToChange)) {
            throw new ValidationError({ id: "User ID in URL must be a valid integer." });
        }

        if (!newRole || !['user', 'admin'].includes(newRole)) {
            throw new ValidationError({ role: "Invalid role specified. Must be 'user' or 'admin'." });
        }

        const userToChange: User | null = await User.findByPk(userIdToChange);

        if (!userToChange) {
            throw new NotFoundError('User');
        }

        if ('role' in userToChange) {
             userToChange.role = newRole;
        } else {
            console.error(`Field 'role' does not exist on User model instance.`);
            throw new Error('Internal server error: User model configuration issue.');
        }

        await userToChange.save({ fields: ['role'] });

        const updatedUser: User | null = await User.findByPk(userIdToChange);

        if (!updatedUser) {
             throw new NotFoundError('User not found after update');
        }

         res.status(200).json({
            message: "User role updated successfully.",
            user: updatedUser
        });

    } catch (error: unknown) {
        next(error);
    }
};