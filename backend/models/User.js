const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Name cannot be empty' },
        len: {
          args: [2, 100],
          msg: 'Name must be between 2 and 100 characters',
        },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: { msg: 'Email address is already in use.' },
      validate: {
        isEmail: { msg: 'Invalid email format.' },
        notEmpty: { msg: 'Email cannot be empty.' },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      allowNull: false,
      defaultValue: 'user',
    },
  },
  {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] },
      },
    },
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
        }
        if (!user.role) {
          user.role = 'user';
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password') && user.password) {
          if (user.password.length < 50 || !user.password.startsWith('$2')) {
            user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
          }
        } else if (user.changed('password') && !user.password) {
          user.password = null;
        }
      },
    },
  },
);

User.prototype.validPassword = async function (passwordToVerify) {
  let userWithHash = this;
  if (!this.password) {
    console.warn(
      `Password hash not present on User instance ${this.id}. Refetching with password scope...`,
    );
    userWithHash = await User.scope('withPassword').findByPk(this.id);
    if (!userWithHash || !userWithHash.password) {
      console.error(
        `Failed to refetch user ${this.id} with password or password hash is null.`,
      );
      return false;
    }
  }
  if (!userWithHash.password) {
    return false;
  }
  return bcrypt.compare(passwordToVerify, userWithHash.password);
};

module.exports = User;
