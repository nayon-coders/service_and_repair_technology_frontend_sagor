import { apiClient } from './api';
import { ApiResponse, ApiNavigationMenuItem } from '../types';

export const fetchUserNavigation = async (): Promise<ApiNavigationMenuItem[]> => {
  const response = await apiClient.get<ApiResponse<{ items: ApiNavigationMenuItem[] }>>('/navigation');
  if (!response.data.success || !response.data.data?.items) {
    throw new Error(response.data.message || 'Failed to retrieve navigation menus');
  }
  return response.data.data.items;
};

