const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: "Event title cannot be empty." },
      len: { args: [3, 100], msg: 'Event title must be between 3 and 100 characters.' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: { args: [0, 2000], msg: 'Description cannot exceed 2000 characters.' }
    }
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: { msg: 'Invalid date format provided.' },
    }
  },
  category: {
    type: DataTypes.ENUM('concert', 'lecture', 'exhibition', 'master class', 'sport'),
    allowNull: false,
    defaultValue: 'lecture',
    validate: {
      notEmpty: { msg: "Category cannot be empty." },
      isIn: {
        args: [['concert', 'lecture', 'exhibition', 'master class', 'sport']],
        msg: 'Invalid category selected. Must be one of: concert, lecture, exhibition, master class, sport.'
      }
    }
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    validate: {
      isInt: { msg: 'Creator ID must be an integer.' }
    }
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false, 
  indexes: [
    { fields: ['date'] },
    { fields: ['created_by'] },
    { fields: ['category'] }
  ]
});

Event.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

User.hasMany(Event, {
  foreignKey: 'created_by',
  as: 'createdEvents'
});

module.exports = Event;