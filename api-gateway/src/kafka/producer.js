import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'streamops-api',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

const producer = kafka.producer();

let isConnected = false;

export async function connectProducer() {
  try {
    await producer.connect();
    isConnected = true;
    console.log('[Kafka] Producer connected successfully');
  } catch (error) {
    console.error('[Kafka] Failed to connect producer:', error.message);
    throw error;
  }
}

export async function publishEvent(topic, event) {
  if (!isConnected) {
    throw new Error('Kafka producer not connected');
  }

  try {
    const message = {
      key: event.payload.workflowId || event.payload.taskId,
      value: JSON.stringify(event),
      timestamp: Date.now().toString()
    };

    await producer.send({
      topic,
      messages: [message]
    });

    console.log(`[Kafka] Event published to topic "${topic}":`, event.eventType);
    return true;
  } catch (error) {
    console.error('[Kafka] Failed to publish event:', error.message);
    throw error;
  }
}

export async function disconnectProducer() {
  if (isConnected) {
    await producer.disconnect();
    isConnected = false;
    console.log('[Kafka] Producer disconnected');
  }
}

export { kafka };
