const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const salaRoutes = require('./routes/salas');
const appointmentRoutes = require('./routes/appointments');
const notificationsRoutes = require('./routes/notifications');
const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/salas', salaRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notifications', notificationsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'LactiConecta API is running' });
});

const seedDatabase = require('./seed');

app.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  try {
    await seedDatabase();
    console.log('Seed check completed on startup.');
  } catch (error) {
    console.error('Error running seed on startup:', error);
  }
});
