import { apiClient } from './api';
import { 
  ApiResponse, 
  TaDaFilterParams, 
  TaDaListResponse, 
  TaDaBillRecord, 
  CreateTaDaBillInput, 
  UpdateTaDaBillInput 
} from '../types';

export const fetchTaDaBills = async (params: TaDaFilterParams = {}): Promise<TaDaListResponse> => {
  const response = await apiClient.get<ApiResponse<TaDaListResponse>>('/management/ta-da', {
    params,
  });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to retrieve TA/DA bills');
  }

  return response.data.data;
};

export const fetchNextTaDaBillNo = async (): Promise<string> => {
  const response = await apiClient.get<ApiResponse<{ billNo: string }>>('/management/ta-da/next-number');
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to generate next TA/DA bill number');
  }
  return response.data.data.billNo;
};

export const fetchTaDaBillById = async (id: string): Promise<TaDaBillRecord> => {
  const response = await apiClient.get<ApiResponse<TaDaBillRecord>>(`/management/ta-da/${id}`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to retrieve TA/DA bill details');
  }
  return response.data.data;
};

export const createTaDaBill = async (data: CreateTaDaBillInput): Promise<TaDaBillRecord> => {
  const response = await apiClient.post<ApiResponse<TaDaBillRecord>>('/management/ta-da', data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to create TA/DA bill');
  }
  return response.data.data;
};

export const updateTaDaBill = async (id: string, data: UpdateTaDaBillInput): Promise<TaDaBillRecord> => {
  const response = await apiClient.put<ApiResponse<TaDaBillRecord>>(`/management/ta-da/${id}`, data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to update TA/DA bill');
  }
  return response.data.data;
};

export const deleteTaDaBill = async (id: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponse<{ id: string }>>(`/management/ta-da/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to delete TA/DA bill');
  }
};

export const bulkDeleteTaDaBills = async (ids: string[]): Promise<number> => {
  const response = await apiClient.post<ApiResponse<{ count: number }>>('/management/ta-da/bulk-delete', { ids });
  if (!response.data.success || response.data.data === undefined) {
    throw new Error(response.data.message || 'Failed to bulk delete TA/DA bills');
  }
  return response.data.data.count;
};

export const downloadTaDaCsv = async (params: TaDaFilterParams = {}): Promise<void> => {
  const response = await apiClient.get('/management/ta-da/export/csv', {
    params,
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `tada-bills-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

