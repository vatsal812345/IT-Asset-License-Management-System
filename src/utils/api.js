import axios from 'axios';

// const api = axios.create({
//   baseURL: 'http://localhost:5000/api',
//   headers: {
//     // Let axios automatically set Content-Type, especially for FormData
//   },
// });

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    // Let axios automatically set Content-Type, especially for FormData
  },
});


// Add a request interceptor to attach the JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration or unauthorized access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login if unauthorized
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
