import { apiClient } from './api';
import { ApiResponse } from '../types';

export const fetchProblemTemplates = async (): Promise<string[]> => {
  try {
    const res = await apiClient.get<ApiResponse<string[]>>('/settings/templates');
    if (res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    return [];
  } catch (err) {
    console.warn('Failed to load problem templates from backend:', err);
    return [];
  }
};

export const saveProblemTemplates = async (templates: string[]): Promise<string[]> => {
  const res = await apiClient.post<ApiResponse<string[]>>('/settings/templates', { templates });
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || 'Failed to save problem templates');
  }
  return res.data.data;
};
