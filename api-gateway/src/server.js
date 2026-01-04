import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectProducer, disconnectProducer } from './kafka/producer.js';
import workflowRoutes from './routes/workflows.js';
import internalRoutes from './routes/internal.js';
import healthRoutes from './routes/health.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/workflows', workflowRoutes);
app.use('/internal', internalRoutes);
app.use('/api/health', healthRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'StreamOps API Gateway',
        version: '1.0.0',
        status: 'running'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[API] Error:', err.message);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        path: req.path
    });
});

// Startup
async function start() {
    try {
        // Connect to Kafka
        console.log('[API] Connecting to Kafka...');
        await connectProducer();

        // Start server
        app.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log('StreamOps API Gateway');
            console.log('='.repeat(50));
            console.log(`Server running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/api/health`);
            console.log(`Kafka brokers: ${process.env.KAFKA_BROKERS}`);
            console.log('='.repeat(50));
        });
    } catch (error) {
        console.error('[API] Failed to start:', error.message);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n[API] Shutting down gracefully...');
    await disconnectProducer();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n[API] Shutting down gracefully...');
    await disconnectProducer();
    process.exit(0);
});

start();
