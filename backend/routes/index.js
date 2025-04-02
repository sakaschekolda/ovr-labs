const express = require('express');
const userRoutes = require('./users.routes');
const eventRoutes = require('./events.routes');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Events API Main Router. Use /users or /events endpoints.',
    timestamp: new Date().toISOString(),
  });
});

router.use('/users', userRoutes);
router.use('/events', eventRoutes);

module.exports = router;