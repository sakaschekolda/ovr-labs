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
import sequelizeConnection from '../db.js';

const SALT_ROUNDS = 10;

export type UserRole = 'user' | 'admin';

export type UserCreationAttributes = Optional<
  InferAttributes<User>,
  'id' | 'created_at' | 'role' | 'password'
>;

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare password: CreationOptional<string | null>;
  declare role: UserRole;
  declare created_at: CreationOptional<Date>;

  public static initializeModel(sequelize: Sequelize): void {
    User.init(
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
          unique: { name: 'unique', msg: 'Email address is already in use.' },
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
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'Users',
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
