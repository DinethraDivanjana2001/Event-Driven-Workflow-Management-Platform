import { v4 as uuidv4 } from 'uuid';

export function createWorkflowEvent(type, payload) {
    return {
        eventType: type,
        eventId: uuidv4(),
        timestamp: new Date().toISOString(),
        payload,
        metadata: {
            source: 'api-gateway',
            apiVersion: '1.0.0'
        }
    };
}

export function createTaskEvent(type, payload) {
    return {
        eventType: type,
        eventId: uuidv4(),
        timestamp: new Date().toISOString(),
        payload,
        metadata: {
            source: 'api-gateway',
            apiVersion: '1.0.0'
        }
    };
}
