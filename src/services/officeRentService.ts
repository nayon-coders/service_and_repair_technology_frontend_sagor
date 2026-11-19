import { apiClient } from './api';
import { 
  ApiResponse, 
  OfficeRentFilterParams, 
  OfficeRentListResponse, 
  OfficeRentRecord, 
  CreateOfficeRentInput, 
  UpdateOfficeRentInput 
} from '../types';

export const fetchOfficeRents = async (params: OfficeRentFilterParams = {}): Promise<OfficeRentListResponse> => {
  const response = await apiClient.get<ApiResponse<OfficeRentListResponse>>('/management/office-rent', {
    params,
  });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to retrieve office rent records');
  }

  return response.data.data;
};

export const fetchOfficeRentById = async (id: string): Promise<OfficeRentRecord> => {
  const response = await apiClient.get<ApiResponse<OfficeRentRecord>>(`/management/office-rent/${id}`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to retrieve office rent details');
  }
  return response.data.data;
};

export const createOfficeRent = async (data: CreateOfficeRentInput): Promise<OfficeRentRecord> => {
  const response = await apiClient.post<ApiResponse<OfficeRentRecord>>('/management/office-rent', data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to create office rent record');
  }
  return response.data.data;
};

export const updateOfficeRent = async (id: string, data: UpdateOfficeRentInput): Promise<OfficeRentRecord> => {
  const response = await apiClient.put<ApiResponse<OfficeRentRecord>>(`/management/office-rent/${id}`, data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to update office rent record');
  }
  return response.data.data;
};

export const deleteOfficeRent = async (id: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponse<{ id: string }>>(`/management/office-rent/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to delete office rent record');
  }
};

export const bulkDeleteOfficeRents = async (ids: string[]): Promise<number> => {
  const response = await apiClient.post<ApiResponse<{ count: number }>>('/management/office-rent/bulk-delete', { ids });
  if (!response.data.success || response.data.data === undefined) {
    throw new Error(response.data.message || 'Failed to bulk delete office rent records');
  }
  return response.data.data.count;
};

export const downloadOfficeRentCsv = async (params: OfficeRentFilterParams = {}): Promise<void> => {
  const response = await apiClient.get('/management/office-rent/export/csv', {
    params,
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `office-rent-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

