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
const salasRoutes = require('./routes/salas');
const postsRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const appointmentsRoutes = require('./routes/appointments');
const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/salas', salasRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/appointments', appointmentsRoutes);

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
