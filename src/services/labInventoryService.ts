import { apiClient } from './api';
import { 
  ApiResponse, 
  LabPartRecord, 
  LabInRecord, 
  CreateLabInInput, 
  UpdateLabInInput, 
  LabInFilterParams, 
  LabInListResponse, 
  LabOutRecord, 
  CreateLabOutInput, 
  UpdateLabOutInput, 
  LabOutFilterParams, 
  LabOutListResponse 
} from '../types';

// ==========================================
// LAB PARTS (CATALOG & STOCK)
// ==========================================

export const fetchLabParts = async (search?: string): Promise<LabPartRecord[]> => {
  const response = await apiClient.get<ApiResponse<LabPartRecord[]>>('/service/lab/parts', {
    params: { search },
  });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to retrieve lab parts');
  }

  return response.data.data;
};

// ==========================================
// LAB IN (STOCK IN)
// ==========================================

export const fetchLabIns = async (params: LabInFilterParams = {}): Promise<LabInListResponse> => {
  const response = await apiClient.get<ApiResponse<LabInListResponse>>('/service/lab/in', {
    params,
  });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to retrieve Lab In records');
  }

  return response.data.data;
};

export const fetchLabInById = async (id: string): Promise<LabInRecord> => {
  const response = await apiClient.get<ApiResponse<LabInRecord>>(`/service/lab/in/${id}`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to retrieve Lab In details');
  }
  return response.data.data;
};

export const createLabIn = async (data: CreateLabInInput): Promise<LabInRecord> => {
  const response = await apiClient.post<ApiResponse<LabInRecord>>('/service/lab/in', data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to create Lab In record');
  }
  return response.data.data;
};

export const updateLabIn = async (id: string, data: UpdateLabInInput): Promise<LabInRecord> => {
  const response = await apiClient.put<ApiResponse<LabInRecord>>(`/service/lab/in/${id}`, data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to update Lab In record');
  }
  return response.data.data;
};

export const deleteLabIn = async (id: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponse<{ id: string }>>(`/service/lab/in/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to delete Lab In record');
  }
};

export const bulkDeleteLabIns = async (ids: string[]): Promise<number> => {
  const response = await apiClient.post<ApiResponse<{ count: number }>>('/service/lab/in/bulk-delete', { ids });
  if (!response.data.success || response.data.data === undefined) {
    throw new Error(response.data.message || 'Failed to bulk delete Lab In records');
  }
  return response.data.data.count;
};

export const downloadLabInsCsv = async (params: LabInFilterParams = {}): Promise<void> => {
  const response = await apiClient.get('/service/lab/in/export/csv', {
    params,
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `lab-in-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// ==========================================
// LAB OUT (STOCK OUT / DISPATCH)
// ==========================================

export const fetchLabOuts = async (params: LabOutFilterParams = {}): Promise<LabOutListResponse> => {
  const response = await apiClient.get<ApiResponse<LabOutListResponse>>('/service/lab/out', {
    params,
  });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to retrieve Lab Out records');
  }

  return response.data.data;
};

export const fetchLabOutById = async (id: string): Promise<LabOutRecord> => {
  const response = await apiClient.get<ApiResponse<LabOutRecord>>(`/service/lab/out/${id}`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to retrieve Lab Out details');
  }
  return response.data.data;
};

export const createLabOut = async (data: CreateLabOutInput): Promise<LabOutRecord> => {
  const response = await apiClient.post<ApiResponse<LabOutRecord>>('/service/lab/out', data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to dispatch Lab Out record');
  }
  return response.data.data;
};

export const updateLabOut = async (id: string, data: UpdateLabOutInput): Promise<LabOutRecord> => {
  const response = await apiClient.put<ApiResponse<LabOutRecord>>(`/service/lab/out/${id}`, data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to update Lab Out record');
  }
  return response.data.data;
};

export const deleteLabOut = async (id: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponse<{ id: string }>>(`/service/lab/out/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to delete Lab Out record');
  }
};

export const bulkDeleteLabOuts = async (ids: string[]): Promise<number> => {
  const response = await apiClient.post<ApiResponse<{ count: number }>>('/service/lab/out/bulk-delete', { ids });
  if (!response.data.success || response.data.data === undefined) {
    throw new Error(response.data.message || 'Failed to bulk delete Lab Out records');
  }
  return response.data.data.count;
};

export const downloadLabOutsCsv = async (params: LabOutFilterParams = {}): Promise<void> => {
  const response = await apiClient.get('/service/lab/out/export/csv', {
    params,
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `lab-out-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

