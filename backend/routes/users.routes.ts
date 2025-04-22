import { Request, Response, NextFunction, Router } from 'express';
import User, { UserRole } from '../models/User.js';
import { ApiError, ValidationError, NotFoundError } from '../error/errors.js';
import { handleAsync } from '../utils/asyncHandler.js';
import 'dotenv/config';

export interface GetAllUsersResponseBody {
  count: number;
  data: User[];
}

export interface ChangeRoleParams {
  id: string;
}

export interface ChangeRoleRequestBody {
  role?: UserRole;
}

export interface ChangeRoleResponseBody {
  message: string;
  user: User;
}

export const getAllUsers = async (
  req: Request,
  res: Response<GetAllUsersResponseBody>,
  next: NextFunction,
): Promise<void> => {
  try {
    const users = await User.findAll();
    res.json({
      count: users.length,
      data: users,
    });
  } catch (error: unknown) {
    next(error);
  }
};

export const changeUserRole = async (
  req: Request<ChangeRoleParams, ChangeRoleResponseBody, ChangeRoleRequestBody>,
  res: Response<ChangeRoleResponseBody>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      throw new ValidationError(
        { role: 'Role is required' },
        'Role change failed validation',
      );
    }

    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await user.update({ role });
    res.json({
      message: 'User role updated successfully',
      user,
    });
  } catch (error: unknown) {
    next(error);
  }
};

const router = Router();

router.get('/', handleAsync(getAllUsers));
router.put('/:id/role', handleAsync(changeUserRole));

export default router;
