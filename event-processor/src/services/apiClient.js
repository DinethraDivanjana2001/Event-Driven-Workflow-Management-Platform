import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_GATEWAY_URL || 'http://localhost:3000';

export async function updateWorkflowStatus(workflowId, status, additionalData = {}) {
    try {
        const payload = {
            status,
            ...additionalData
        };

        const response = await axios.patch(
            `${API_URL}/internal/workflows/${workflowId}`,
            payload
        );

        console.log(`[API Client] Updated workflow ${workflowId} to status: ${status}`);
        return response.data;
    } catch (error) {
        console.error(`[API Client] Failed to update workflow ${workflowId}:`, error.message);
        throw error;
    }
}

export async function updateTaskStatus(taskId, status, additionalData = {}) {
    try {
        const payload = {
            status,
            ...additionalData
        };

        const response = await axios.patch(
            `${API_URL}/internal/tasks/${taskId}`,
            payload
        );

        console.log(`[API Client] Updated task ${taskId} to status: ${status}`);
        return response.data;
    } catch (error) {
        console.error(`[API Client] Failed to update task ${taskId}:`, error.message);
        throw error;
    }
}
