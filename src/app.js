const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
const { sequelize } = require('./models');


// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notification');
const documentRoutes = require('./routes/documents');
const activityRoutes = require('./routes/activity');
const workLogRoutes = require('./routes/worklog');
const skillRoutes = require('./routes/skill');
const projectRoutes = require('./routes/projects');
const dashboardRoutes = require('./routes/dashboard');
// start background jobs (schedules)
//require('./jobs/promoteActivities');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev')); // * Useful for viewing HTTP requests via console

// Config path in each route
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/notification', notificationRoutes);
app.use('/document', documentRoutes);
app.use('/activity', activityRoutes);
// Mount plural path for compatibility with frontend expectations
app.use('/activities', activityRoutes);
app.use('/worklog', workLogRoutes);
app.use('/skill', skillRoutes);
app.use('/projects', projectRoutes);
app.use('/dashboard', dashboardRoutes);

app.use(errorHandler); // * Middleware to manage errors

const port = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Successful connection to Postgres with Sequelize');

    app.listen(port, () => {
      console.log(`API running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('❌ Error starting Sequelize:', err);
    process.exit(1);
  }
})();
