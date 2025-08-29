import axios from 'axios';

const apiClient = axios.create({

  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
  withCredentials: true,

});

export const api = {

    auth:{
        register: (credentials) => apiClient.post('/users/register', credentials),
        login: (credentials) => apiClient.post('/users/login', credentials),
        logout: () => apiClient.post('/users/logout'),
        getProfile: () => apiClient.get('/users/me'),
    },
    payments: {
        settleUp: (groupId, data) => apiClient.post(`/payments/settle/${groupId}`, data)
    }
}

export default apiClient;