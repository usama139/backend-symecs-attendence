const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const teacherRoutes = require('./src/routes/teacher');
const { initRouter } = require('./src/models/AttendanceRouter');

mongoose.connect('mongodb+srv://symecs:symecs@cluster0.zrguy7u.mongodb.net/attendancedb')
    .then(() => {
        console.log('MongoDB Master Connected');
        initRouter(); // Fires up Cluster 2 logic
    })
    .catch(err => console.log(err));

app.get('/', (req, res) => res.send('API Running'));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/teacher', require('./src/routes/teacher'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
