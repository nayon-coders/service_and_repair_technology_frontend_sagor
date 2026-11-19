export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  appName: 'Business Management System',
  appVersion: '1.0.0',
  environment: import.meta.env.MODE || 'development',
};

