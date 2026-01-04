import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';
import { handleWorkflowEvent } from '../handlers/workflowHandler.js';

dotenv.config();

const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || 'streamops-worker',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    retry: {
        initialRetryTime: 100,
        retries: 8
    }
});

const consumer = kafka.consumer({
    groupId: process.env.KAFKA_GROUP_ID || 'workflow-processors',
    sessionTimeout: 30000,
    heartbeatInterval: 3000
});

export async function startConsumer() {
    try {
        // Connect consumer
        await consumer.connect();
        console.log('[Kafka Consumer] Connected successfully');

        // Subscribe to topics
        await consumer.subscribe({
            topics: ['workflows', 'tasks'],
            fromBeginning: false
        });
        console.log('[Kafka Consumer] Subscribed to topics: workflows, tasks');

        // Start consuming
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const event = JSON.parse(message.value.toString());

                    console.log(`\n[Kafka Consumer] Received event from topic "${topic}":`, event.eventType);

                    // Route to appropriate handler
                    if (topic === 'workflows') {
                        await handleWorkflowEvent(event);
                    } else if (topic === 'tasks') {
                        // Task handler would go here
                        console.log('[Kafka Consumer] Task processing not yet implemented');
                    }

                } catch (error) {
                    console.error('[Kafka Consumer] Error processing message:', error.message);
                    console.error('[Kafka Consumer] Message:', message.value.toString());
                }
            }
        });

        console.log('[Kafka Consumer] Started consuming messages...\n');

    } catch (error) {
        console.error('[Kafka Consumer] Failed to start:', error.message);
        throw error;
    }
}

export async function stopConsumer() {
    try {
        await consumer.disconnect();
        console.log('[Kafka Consumer] Disconnected');
    } catch (error) {
        console.error('[Kafka Consumer] Error disconnecting:', error.message);
    }
}
