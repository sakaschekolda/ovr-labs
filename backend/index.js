const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const sequelize = require('./db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Server works',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection established');
    app.listen(PORT, (error) => {
      if (error) {
        console.error('Error occured on server start', error);
        process.exit(1);
      } else {
        console.log(`✅ Server is on port ${PORT}`);
        console.log(`➡️  Check: http://localhost:${PORT}`);
      }
    });
  })
  .catch(err => {
    console.error('❌ Unable to connect to database:', err);
    process.exit(1);
  });