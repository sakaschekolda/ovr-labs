const express = require('express');
const userRoutes = require('./users.routes');
const eventRoutes = require('./events.routes');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/events', eventRoutes);

router.get('/', (req, res) => {
  res.json({
    message:
      'API Main Protected Router. Contains /users and /events endpoints.',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
