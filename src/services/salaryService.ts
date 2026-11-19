import { apiClient } from './api';
import {
  ApiResponse,
  SalaryRecordData,
  CreateSalaryInput,
  UpdateSalaryInput,
  SalaryFilterParams,
  SalaryListResponse,
} from '../types';

export const fetchSalaryRecords = async (params: SalaryFilterParams = {}): Promise<SalaryListResponse> => {
  const response = await apiClient.get<ApiResponse<SalaryListResponse>>('/management/salary', {
    params,
  });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to retrieve salary records');
  }

  return response.data.data;
};

export const fetchSalaryRecordById = async (id: string): Promise<SalaryRecordData> => {
  const response = await apiClient.get<ApiResponse<SalaryRecordData>>(`/management/salary/${id}`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to retrieve salary record details');
  }
  return response.data.data;
};

export const createSalaryRecord = async (data: CreateSalaryInput): Promise<SalaryRecordData> => {
  const response = await apiClient.post<ApiResponse<SalaryRecordData>>('/management/salary', data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to create salary record');
  }
  return response.data.data;
};

export const updateSalaryRecord = async (id: string, data: UpdateSalaryInput): Promise<SalaryRecordData> => {
  const response = await apiClient.put<ApiResponse<SalaryRecordData>>(`/management/salary/${id}`, data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to update salary record');
  }
  return response.data.data;
};

export const deleteSalaryRecord = async (id: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponse<{ id: string }>>(`/management/salary/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to delete salary record');
  }
};

export const bulkDeleteSalaryRecords = async (ids: string[]): Promise<number> => {
  const response = await apiClient.post<ApiResponse<{ count: number }>>('/management/salary/bulk-delete', { ids });
  if (!response.data.success || response.data.data === undefined) {
    throw new Error(response.data.message || 'Failed to bulk delete salary records');
  }
  return response.data.data.count;
};

export const downloadSalaryCsv = async (params: SalaryFilterParams = {}): Promise<void> => {
  const response = await apiClient.get('/management/salary/export/csv', {
    params,
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const filename = `salary_sheet_${params.month ? params.month.replace(/\s+/g, '_') : 'all'}_${new Date().toISOString().split('T')[0]}.csv`;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

