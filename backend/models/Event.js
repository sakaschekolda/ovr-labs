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
      notEmpty: {
        msg: 'Title cannot be empty'
      },
      len: {
        args: [3, 100],
        msg: 'Title must be between 3 and 100 characters'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    validate: {
      len: {
        args: [0, 2000],
        msg: 'Description too long (max 2000 characters)'
      }
    }
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: {
        msg: 'Invalid date format'
      },
      isAfter: {
        args: new Date().toISOString(),
        msg: 'Event date must be in the future'
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
      isInt: {
        msg: 'Creator ID must be an integer'
      }
    }
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['date']
    },
    {
      fields: ['created_by']
    }
  ]
});

Event.belongsTo(User, { 
  foreignKey: 'created_by',
  as: 'creator'
});

User.hasMany(Event, { 
  foreignKey: 'created_by',
  as: 'events'
});

module.exports = Event;