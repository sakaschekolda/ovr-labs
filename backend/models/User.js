const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Name cannot be empty'
      },
      len: {
        args: [2, 100],
        msg: 'Name must be between 2 and 100 characters'
      }
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: {
      name: 'unique_email',
      msg: 'Email already in use'
    },
    validate: {
      isEmail: {
        msg: 'Invalid email format'
      },
      notEmpty: {
        msg: 'Email cannot be empty'
      }
    }
  },
  password: {
    type: DataTypes.STRING(64),
    allowNull: false,
    validate: {
      len: {
        args: [8, 64],
        msg: 'Password must be between 8 and 64 characters'
      }
    }
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  defaultScope: {
    attributes: { exclude: ['password'] }
  }
});

module.exports = User;