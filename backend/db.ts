import { Sequelize, Options } from 'sequelize';
import 'dotenv/config';

const enableLogging = process.env.NODE_ENV !== 'production';

const requiredEnv: string[] = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST'];
const missingEnv: string[] = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`❌ Missing required environment variables for database connection: ${missingEnv.join(', ')}`);
  console.error("   Please ensure they are defined in your .env file or system environment.");
  process.exit(1);
}

const dbName = process.env.DB_NAME as string;
const dbUser = process.env.DB_USER as string;
const dbPassword = process.env.DB_PASSWORD as string;
const dbHost = process.env.DB_HOST as string;
const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;

if (isNaN(dbPort)) {
    console.error(`❌ Invalid DB_PORT specified: ${process.env.DB_PORT}. Must be a number.`);
    process.exit(1);
}

const sequelizeOptions: Options = {
    host: dbHost,
    port: dbPort,
    dialect: 'postgres',
    logging: enableLogging ? console.log : false,
};

const sequelizeConnection = new Sequelize(dbName, dbUser, dbPassword, sequelizeOptions);

export default sequelizeConnection;