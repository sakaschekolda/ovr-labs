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
      notEmpty: true,
    },
  },
  description: {
    type: DataTypes.TEXT,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

Event.belongsTo(User, { foreignKey: 'created_by' });
User.hasMany(Event, { foreignKey: 'created_by' });

module.exports = Event;