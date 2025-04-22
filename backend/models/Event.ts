import {
  DataTypes,
  Model,
  CreationOptional,
  Sequelize,
  ForeignKey,
  NonAttribute,
  Optional,
  InferAttributes,
  InferCreationAttributes
} from 'sequelize';
import sequelizeConnection from '../db.js';
import User from './User.js';

export type EventCategory = 'concert' | 'lecture' | 'exhibition' | 'master class' | 'sport';

const validCategories: EventCategory[] = ['concert', 'lecture', 'exhibition', 'master class', 'sport'];

// Убираем EventCreationAttributes
// export interface EventCreationAttributes extends Optional<EventAttributesForModel, 'id' | 'description' | 'created_at'> {}

// Интерфейс атрибутов для экземпляра (для ясности)
interface EventAttributesForModel {
  id: number;
  title: string;
  description: string | null;
  date: Date;
  category: EventCategory;
  created_by: ForeignKey<User['id']>;
  created_at: Date;
}

class Event extends Model<InferAttributes<Event>, InferCreationAttributes<Event>> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare description: CreationOptional<string | null>;
  declare date: Date;
  declare category: EventCategory;
  declare created_by: ForeignKey<User['id']>;
  declare readonly created_at: CreationOptional<Date>;

  declare readonly creator?: NonAttribute<User>;

  public static initializeModel(sequelize: Sequelize): void {
    Event.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        title: {
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Event title cannot be empty.' },
            len: {
              args: [3, 100],
              msg: 'Event title must be between 3 and 100 characters.',
            },
          },
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
          validate: {
            len: {
              args: [0, 2000],
              msg: 'Description cannot exceed 2000 characters.',
            },
          },
        },
        date: {
          type: DataTypes.DATE,
          allowNull: false,
          validate: {
            isDate: { args: true, msg: 'Invalid date format provided.' },
          },
        },
        category: {
          type: DataTypes.ENUM(...validCategories),
          allowNull: false,
          defaultValue: 'lecture',
          validate: {
            notEmpty: { msg: 'Category cannot be empty.' },
            isIn: {
              args: [validCategories],
              msg: `Invalid category selected. Must be one of: ${validCategories.join(', ')}.`,
            },
          },
        },
        created_by: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Users',
            key: 'id',
          },
          validate: {
            isInt: { msg: 'Creator ID must be an integer.' },
          },
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
      },
      {
        sequelize,
        tableName: 'Events',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
          { fields: ['date'] },
          { fields: ['created_by'] },
          { fields: ['category'] },
        ],
      }
    );
  }

  public static initializeAssociations(): void {
      Event.belongsTo(User, {
        foreignKey: 'created_by',
        as: 'creator',
      });

       User.hasMany(Event, {
         foreignKey: 'created_by',
         as: 'createdEvents',
       });
  }
}

Event.initializeModel(sequelizeConnection);
Event.initializeAssociations();

export default Event;