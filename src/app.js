const express = require('express');
const cors = require('cors');

const jobsRoutes = require('./routes/jobs.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const publicRoutes = require('./routes/public.routes');
const categoryRoutes = require('./routes/category.routes');

const app = express();



app.use(cors());
app.use(express.json());

app.use('/api/jobs', jobsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/public', publicRoutes);   
app.use('/api/category', categoryRoutes);

module.exports = app;