const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path'); 
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();

// Configuration
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student-management';
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Connect to MongoDB
mongoose.set('strictQuery', false);
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.info('Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
    // Do not exit here; allow the app to surface errors to caller
});

// Routes
// Expect these route files to exist:
// - src/routes/auth.js (handles /auth/signup and /auth/login)
// - src/routes/studentRoutes.js (handles /students CRUD)
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');

app.use('/auth', authRoutes);
app.use('/', studentRoutes);

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'Not Found' });
});

// Generic error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal server error';
    res.status(status).json({ message });
});

// If this file is run directly, start the server
if (require.main === module) {
    app.listen(PORT, () => {
        console.info(`Server running on port ${PORT}`);
    });
}

module.exports = app;
