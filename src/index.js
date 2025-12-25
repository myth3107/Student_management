const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 3000;
// require DB URL only from env; do NOT fall back to a hardcoded URI
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('Missing MONGO_URI environment variable. Set it in .env or your environment and restart.');
    process.exit(1);
}

let server;

async function start() {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.info('Connected to MongoDB');

        server = app.listen(PORT, () => {
            console.info(`Server listening on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start application:', err);
        process.exit(1);
    }
}

// Graceful shutdown
async function shutdown(signal) {
    try {
        console.info(`Received ${signal}, closing server...`);
        if (server) {
            await new Promise((resolve, reject) => server.close(err => (err ? reject(err) : resolve())));
        }
        if (mongoose.connection && mongoose.connection.readyState === 1) {
            await mongoose.connection.close(false);
            console.info('MongoDB connection closed');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
}

// Handle unexpected errors
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    // Give a brief moment for logs to flush then exit
    setTimeout(() => process.exit(1), 100);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // crash safely
    setTimeout(() => process.exit(1), 100);
});

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// If this file is executed directly, start the server.
if (require.main === module) {
    start();
}
