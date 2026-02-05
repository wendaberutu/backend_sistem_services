const express = require('express');
const cors = require('cors');

const inventoryRoutes = require('./routes/inventory.routes');
const categoryRoutes = require('./routes/category.routes');
const jobRoutes = require('./routes/jobs.routes');
const publicRoutes = require('./routes/public.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');  
const usedPartsRoutes = require('./routes/usedPart.routes');   
const errorMiddleware = require("./middlewares/error.middleware");
const cookieparser = require('cookie-parser');   

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(cookieparser());

app.use('/api/jobs', jobRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/public', publicRoutes);   
app.use('/api/category', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use("/api/used-parts", usedPartsRoutes);

app.use(errorMiddleware);
module.exports = app;