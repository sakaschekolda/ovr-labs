import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';
import { ValidationError } from '@utils/errors';
import User, { UserRole } from '@models/User';
import { handleAsync } from '@utils/asyncHandler';
import passport from '@config/passport';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

const router = Router();

const jwtAuthMiddleware = passport.authenticate('jwt', {
  session: false,
}) as RequestHandler;

/**
 * @swagger
 * /api/users/{id}/role:
 *   put:
 *     summary: Update user role (Admin only)
 *     tags: [Protected Routes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *         description: Numeric ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 description: New role for the user
 *                 example: "admin"
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User role updated successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid role or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required or token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Only administrators can change user roles
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  '/:id/role',
  jwtAuthMiddleware,
  handleAsync<
    { id: string },
    { message: string; user: User },
    { role: UserRole },
    ParsedQs
  >(async (req, res, next) => {
    try {
      const adminUser = req.user as User | undefined;
      const { id } = req.params;
      const { role } = req.body;

      if (!adminUser) {
        throw new ValidationError(
          { auth: 'User not authenticated' },
          'Role update failed.',
        );
      }

      if (adminUser.role !== 'admin') {
        throw new ValidationError(
          { auth: 'Only administrators can change user roles' },
          'Role update failed.',
        );
      }

      const userToUpdate = await User.findByPk(id);
      if (!userToUpdate) {
        throw new ValidationError(
          { user: 'User not found' },
          'Role update failed.',
        );
      }

      if (!['user', 'admin'].includes(role)) {
        throw new ValidationError(
          { role: 'Invalid role specified' },
          'Role update failed.',
        );
      }

      await userToUpdate.update({ role });
      
      res.json({
        message: 'User role updated successfully',
        user: userToUpdate,
      });
    } catch (error) {
      next(error);
    }
  }),
);

export default router;
