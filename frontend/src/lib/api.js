import axios from 'axios';

const BACKEND_URL = "http://localhost:8000";
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

// Event APIs
export const eventApi = {
    getAll: (params) => api.get('/events', { params }),
    getOne: (id) => api.get(`/events/${id}`),
    create: (data) => api.post('/events', data),
    update: (id, data) => api.put(`/events/${id}`, data),
    delete: (id) => api.delete(`/events/${id}`),
    getMyEvents: () => api.get('/my-events'),
    getCategories: () => api.get('/categories'),
};

// Registration APIs
export const registrationApi = {
    register: (eventId) => api.post(`/events/${eventId}/register`),
    unregister: (eventId) => api.delete(`/events/${eventId}/unregister`),
    getMyRegistrations: () => api.get('/my-registrations'),
    getEventRegistrations: (eventId) => api.get(`/events/${eventId}/registrations`),
};

// Review APIs
export const reviewApi = {
    create: (data) => api.post('/reviews', data),
    getEventReviews: (eventId) => api.get(`/events/${eventId}/reviews`),
};

// Notification APIs
export const notificationApi = {
    getAll: () => api.get('/notifications'),
    markRead: (id) => api.put(`/notifications/${id}/read`),
    markAllRead: () => api.put('/notifications/read-all'),
};

// Analytics APIs
export const analyticsApi = {
    getOverview: () => api.get('/analytics/overview'),
};

// Upload API
export const uploadApi = {
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

export default api;
