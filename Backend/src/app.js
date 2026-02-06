const express = require('express');
const app = express();
const authRoutes = require('./routes/auth.routes');
const vehicleRoutes = require('./routes/vehicles.routes');
const driverRoutes = require('./routes/drivers.routes');
const tripRoutes = require('./routes/trips.routes');
const reportRoutes = require('./routes/reports.routes');

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/drivers', driverRoutes);
app.use('/trips', tripRoutes);
app.use('/reports', reportRoutes);

module.exports = app;
