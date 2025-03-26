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

app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: {
          name: !name ? 'Name is required' : null,
          email: !email ? 'Email is required' : null
        }
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: {
          email: 'Invalid email format'
        }
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Conflict',
        message: 'Email already in use'
      });
    }

    const user = await User.create({ name, email });
    res.status(201).json({
      status: 'success',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Something went wrong'
    });
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'created_at'],
      order: [['created_at', 'DESC']]
    });
    res.status(200).json({
      status: 'success',
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch users'
    });
  }
});

app.get('/events', async (req, res) => {
  try {
    const events = await Event.findAll();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/events/:id', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/events', async (req, res) => {
  try {
    const { title, description, date, created_by } = req.body;
    if (!title || !date || !created_by) {
      return res.status(400).json({ error: 'Title, date and created_by are required' });
    }
    const event = await Event.create({ title, description, date, created_by });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/events/:id', async (req, res) => {
  try {
    const { title, description, date } = req.body;
    if (!title && !description && !date) {
      return res.status(400).json({ error: 'At least one field to update is required' });
    }
    const [updated] = await Event.update(
      { title, description, date },
      { where: { id: req.params.id } }
    );
    if (updated === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const updatedEvent = await Event.findByPk(req.params.id);
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/events/:id', async (req, res) => {
  try {
    const deleted = await Event.destroy({
      where: { id: req.params.id }
    });
    if (deleted === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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