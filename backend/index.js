const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const sequelize = require('./db');
const User = require('./models/User');
const Event = require('./models/Event');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Server works',
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(async () => {
    console.log('✅ Database connection established');

    try {
      await User.sync({ alter: true });
      await Event.sync({ alter: true });
      console.log('✅ All models synchronized');
    } catch (syncError) {
      console.error('❌ Model sync error:', syncError);
      process.exit(1);
    }

    app.listen(PORT, (error) => {
      if (error) {
        console.error('Error occurred on server start', error);
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