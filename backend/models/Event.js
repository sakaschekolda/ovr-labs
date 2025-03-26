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
        msg: "Name field can't be empty"
      },
      len: {
        args: [3, 100],
        msg: 'Name must be from 3 to 100 symbols'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    validate: {
      len: {
        args: [0, 2000],
        msg: 'Description is too large (2000 symbols at most)'
      }
    }
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: {
        msg: 'Wrong data format'
      },
      isAfter: {
        args: new Date().toISOString(),
        msg: 'Event date must be oncoming'
      }
    }
  },
  category: {
    type: DataTypes.ENUM('concert', 'lecture', 'exhibition', 'master class', 'sport'),
    allowNull: false,
    defaultValue: 'lecture',
    validate: {
      notEmpty: {
        msg: "Category field can't be empty"
      },
      isIn: {
        args: [['concert', 'lecture', 'exhibition', 'master class', 'sport']],
        msg: 'Forbidden category'
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
        msg: 'Creator ID must be a number'
      }
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
  as: 'events'
});

module.exports = Event;