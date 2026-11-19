import { apiClient } from './api';
import { ApiResponse, DashboardStats } from '../types';

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to fetch dashboard statistics');
  }
  return response.data.data;
};

