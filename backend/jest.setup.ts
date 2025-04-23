import 'dotenv/config';
import sequelizeConnection from '@config/db';
import { beforeAll, afterAll } from '@jest/globals';

process.env.NODE_ENV = 'test';

beforeAll(async () => {
  try {
    await sequelizeConnection.authenticate();
    console.log('Test database connection established');
  } catch (error) {
    console.error('Test database connection failed:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    await sequelizeConnection.close();
    console.log('Test database connection closed');
  } catch (error) {
    console.error('Error closing test database connection:', error);
  }
});
