import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
  ModelStatic,
  Optional,
} from 'sequelize';
import bcrypt from 'bcrypt';
import sequelizeConnection from '@config/db';

const SALT_ROUNDS = 10;

export type UserRole = 'user' | 'admin';
export type UserGender = 'male' | 'female' | 'other';

export type UserCreationAttributes = Optional<
  InferAttributes<User>,
  'id' | 'createdAt' | 'role' | 'password'
>;

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare firstName: string;
  declare lastName: string;
  declare middleName: string;
  declare email: string;
  declare password: CreationOptional<string | null>;
  declare role: UserRole;
  declare gender: UserGender;
  declare birthDate: string;
  declare createdAt: CreationOptional<Date>;

  public static initializeModel(sequelize: Sequelize): void {
    User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        firstName: {
          type: DataTypes.STRING(50),
          allowNull: false,
          validate: {
            notEmpty: { msg: 'First name cannot be empty' },
            len: {
              args: [2, 50],
              msg: 'First name must be between 2 and 50 characters',
            },
          },
        },
        lastName: {
          type: DataTypes.STRING(50),
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Last name cannot be empty' },
            len: {
              args: [2, 50],
              msg: 'Last name must be between 2 and 50 characters',
            },
          },
        },
        middleName: {
          type: DataTypes.STRING(50),
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Middle name cannot be empty' },
            len: {
              args: [2, 50],
              msg: 'Middle name must be between 2 and 50 characters',
            },
          },
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: { name: 'unique', msg: 'Email address is already in use.' },
          validate: {
            isEmail: { msg: 'Invalid email format.' },
            notEmpty: { msg: 'Email cannot be empty.' },
          },
        },
        password: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: {
            len: {
              args: [8, 100],
              msg: 'Password must be at least 8 characters long'
            }
          }
        },
        role: {
          type: DataTypes.ENUM('user', 'admin'),
          allowNull: false,
          defaultValue: 'user',
        },
        gender: {
          type: DataTypes.ENUM('male', 'female', 'other'),
          allowNull: false,
          validate: {
            isIn: {
              args: [['male', 'female', 'other']],
              msg: 'Invalid gender value'
            }
          }
        },
        birthDate: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isDate: { msg: 'Invalid birth date format', args: true },
            notEmpty: { msg: 'Birth date cannot be empty' }
          }
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'Users',
        timestamps: true,
        createdAt: 'createdAt',
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
          beforeCreate: async (user: User): Promise<void> => {
            if (user.password) {
              user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
            }
          },
          beforeUpdate: async (user: User): Promise<void> => {
            if (user.changed('password') && user.getDataValue('password')) {
              const newPassword = user.getDataValue('password');
              if (
                typeof newPassword === 'string' &&
                (newPassword.length < 50 || !newPassword.startsWith('$2'))
              ) {
                user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
              }
            } else if (
              user.changed('password') &&
              !user.getDataValue('password')
            ) {
              user.password = null;
            }
          },
        },
      },
    );
  }

  public async validPassword(passwordToVerify: string): Promise<boolean> {
    let passwordHash = this.getDataValue('password');

    if (!passwordHash) {
      console.warn(
        `Password hash not present on User instance ${this.id}. Refetching with password scope...`,
      );
      const UserWithScope = User.scope('withPassword') as typeof User;
      const userWithHash = await UserWithScope.findByPk(this.id);

      if (!userWithHash || !userWithHash.getDataValue('password')) {
        console.error(
          `Failed to refetch user ${this.id} with password or password hash is null.`,
        );
        return false;
      }
      passwordHash = userWithHash.getDataValue('password');
    }

    if (typeof passwordHash !== 'string') {
      return false;
    }

    return bcrypt.compare(passwordToVerify, passwordHash);
  }
}

User.initializeModel(sequelizeConnection);

export default User;
