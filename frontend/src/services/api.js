import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const workflowApi = {
    create: async (data) => {
        const response = await api.post('/api/workflows', data);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/api/workflows/${id}`);
        return response.data;
    },

    list: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.limit) params.append('limit', filters.limit);
        if (filters.offset) params.append('offset', filters.offset);

        const response = await api.get(`/api/workflows?${params.toString()}`);
        return response.data;
    }
};

export const healthApi = {
    check: async () => {
        const response = await api.get('/api/health');
        return response.data;
    }
};

export default api;
