import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { config } from '../config/environment';

export const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 10000,
  withCredentials: true, // Enables HttpOnly cookie transmission
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach bearer token if stored locally (dual cookie + header support)
apiClient.interceptors.request.use(
  (requestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && requestConfig.headers) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 unauthorized & 403 license suspension
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      // Clear local storage if token expired or invalid
      localStorage.removeItem('auth_token');
    }

    if (error.response?.status === 403 && error.response?.data?.licenseSuspended) {
      // Dispatch license suspended event across the frontend app
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('app-license-suspended', {
            detail: error.response.data,
          })
        );
      }
    }

    return Promise.reject(error);
  }
);
