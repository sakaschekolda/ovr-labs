const { Sequelize } = require('sequelize');
require('dotenv').config();

const enableLogging = process.env.NODE_ENV !== 'production';

const requiredEnv = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST'];
const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`❌ Missing required environment variables for database connection: ${missingEnv.join(', ')}`);
  console.error("   Please ensure they are defined in your .env file or system environment.");
  process.exit(1);
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: enableLogging ? console.log : false,
  }
);

module.exports = sequelize;