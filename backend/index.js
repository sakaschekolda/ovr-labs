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
    const { category } = req.query;
    const where = {};
    
    if (category) {
      where.category = category;
    }

    const events = await Event.findAll({
      where,
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name']
      }],
      order: [['date', 'ASC']]
    });
    
    res.status(200).json({
      status: 'success',
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch events'
    });
  }
});

app.get('/events/categories', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      categories: ['концерт', 'лекция', 'выставка', 'мастер-класс', 'спорт']
    }
  });
});

app.get('/events/:id', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name']
      }]
    });
    if (!event) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Event not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch event'
    });
  }
});

app.post('/events', async (req, res) => {
  try {
    const { title, description, date, created_by, category } = req.body;
    
    if (!title || !date || !created_by || !category) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: {
          title: !title ? 'Title is required' : null,
          date: !date ? 'Date is required' : null,
          created_by: !created_by ? 'Creator ID is required' : null,
          category: !category ? 'Category is required' : null
        },
        allowed_categories: ['концерт', 'лекция', 'выставка', 'мастер-класс', 'спорт']
      });
    }

    const event = await Event.create({ 
      title, 
      description, 
      date, 
      created_by, 
      category 
    });
    
    res.status(201).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({ 
        error: 'Validation error',
        details: errors
      });
    }
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create event'
    });
  }
});

app.put('/events/:id', async (req, res) => {
  try {
    const { title, description, date, category } = req.body;
    
    if (!title && !description && !date && !category) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'At least one field to update is required'
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (date) updateData.date = date;
    if (category) updateData.category = category;

    const [updated] = await Event.update(updateData, {
      where: { id: req.params.id }
    });
    
    if (updated === 0) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Event not found'
      });
    }
    
    const updatedEvent = await Event.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name']
      }]
    });
    
    res.status(200).json({
      status: 'success',
      data: updatedEvent
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({ 
        error: 'Validation error',
        details: errors
      });
    }
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update event'
    });
  }
});

app.delete('/events/:id', async (req, res) => {
  try {
    const deleted = await Event.destroy({
      where: { id: req.params.id }
    });
    if (deleted === 0) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Event not found'
      });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to delete event'
    });
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