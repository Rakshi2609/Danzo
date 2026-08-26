import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000
});

// Request interceptor: Add auth token (7-day JWT or Firebase token)
api.interceptors.request.use(async (config) => {
  console.log('🔶 API: Request to', config.url);
  const storedToken = localStorage.getItem('token');
  if (storedToken) {
    config.headers.Authorization = `Bearer ${storedToken}`;
  } else {
    const user = auth.currentUser;
    if (user) {
      console.log('🔶 API: Adding auth token to request');
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('🔶 API: No user, sending request without token');
    }
  }
  return config;
});

// Response interceptor: Handle errors & automatic token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.error('❌ API: Request failed', originalRequest?.url, 'Status:', error.response?.status);
    
    // If 401 Unauthorized, attempt token refresh and retry once
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      originalRequest._retry = true;
      try {
        const user = auth.currentUser;
        if (user) {
          console.log('🔄 API: Attempting to refresh token with Firebase...');
          const freshIdToken = await user.getIdToken(true);
          
          // Exchange for 7-day JWT
          const refreshRes = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/auth/login', {
            token: freshIdToken,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          });
          
          const newToken = refreshRes.data?.token || freshIdToken;
          localStorage.setItem('token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          console.log('🔄 API: Token refreshed successfully, retrying request...');
          return api(originalRequest);
        }
      } catch (refreshErr) {
        console.error('❌ API: Token refresh failed:', refreshErr.message);
      }

      // If refresh failed and user is unauthenticated
      if (window.location.pathname !== '/login') {
        console.log('❌ API: 401 Unauthorized, clearing session...');
        localStorage.removeItem('token');
        await auth.signOut();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
