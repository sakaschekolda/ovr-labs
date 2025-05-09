import { Request, Response } from 'express';
import User from '../models/User';
import Event from '../models/Event';
import { NotFoundError, ValidationError } from '@utils/errors';
import { UserGender } from '../models/User';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new NotFoundError('User not found');
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new NotFoundError('User not found');
    }

    const {
      firstName,
      lastName,
      middleName,
      gender,
      birthDate
    } = req.body;

    // Валидация полей
    const validationErrors: Record<string, string> = {};
    if (!firstName) validationErrors.firstName = 'First name is required';
    if (!lastName) validationErrors.lastName = 'Last name is required';
    if (!middleName) validationErrors.middleName = 'Middle name is required';
    if (!gender) validationErrors.gender = 'Gender is required';
    if (!birthDate) validationErrors.birthDate = 'Birth date is required';

    if (Object.keys(validationErrors).length > 0) {
      throw new ValidationError(validationErrors);
    }

    if (!['male', 'female', 'other'].includes(gender)) {
      throw new ValidationError({
        gender: 'Invalid gender value'
      });
    }

    const birthDateObj = new Date(birthDate);
    if (isNaN(birthDateObj.getTime())) {
      throw new ValidationError({
        birthDate: 'Invalid birth date format'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Format birthDate as YYYY-MM-DD string
    const formattedBirthDate = birthDateObj.toISOString().split('T')[0];

    // Обновляем поля
    await user.update({
      firstName,
      lastName,
      middleName,
      gender: gender as UserGender,
      birthDate: formattedBirthDate
    });

    // Получаем обновленного пользователя без пароля
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

export const getUserEvents = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const events = await Event.findAll({
      where: { created_by: userId },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'middleName', 'role']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Форматируем даты и добавляем имя создателя
    const formattedEvents = events.map(event => ({
      ...event.toJSON(),
      date: event.date.toISOString(),
      createdAt: event.createdAt.toISOString(),
      creator: event.creator ? {
        ...event.creator.toJSON(),
        name: `${event.creator.firstName} ${event.creator.lastName}`
      } : null
    }));

    res.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 