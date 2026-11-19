import { apiClient } from './api';
import { ApiResponse, HealthData } from '../types';

export const checkHealth = async (): Promise<ApiResponse<HealthData>> => {
  const response = await apiClient.get<ApiResponse<HealthData>>('/health');
  return response.data;
};

