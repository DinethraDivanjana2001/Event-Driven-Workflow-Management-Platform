import dotenv from 'dotenv';
import { startConsumer, stopConsumer } from './kafka/consumer.js';

dotenv.config();

console.log('='.repeat(60));
console.log('StreamOps Event Processor');
console.log('='.repeat(60));
console.log(`Kafka Brokers: ${process.env.KAFKA_BROKERS}`);
console.log(`Consumer Group: ${process.env.KAFKA_GROUP_ID}`);
console.log(`API Gateway: ${process.env.API_GATEWAY_URL}`);
console.log('='.repeat(60));

async function start() {
    try {
        console.log('[Worker] Starting event processor...\n');
        await startConsumer();
        console.log('[Worker] Event processor is running. Press Ctrl+C to stop.\n');
    } catch (error) {
        console.error('[Worker] Failed to start:', error.message);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n[Worker] Shutting down gracefully...');
    await stopConsumer();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n[Worker] Shutting down gracefully...');
    await stopConsumer();
    process.exit(0);
});

start();
