import { apiClient } from './api';
import { 
  ApiResponse, 
  IncomeFilterParams, 
  IncomeListResponse, 
  IncomeRecord, 
  CreateIncomeInput, 
  UpdateIncomeInput 
} from '../types';

export const fetchIncomes = async (params: IncomeFilterParams = {}): Promise<IncomeListResponse> => {
  const response = await apiClient.get<ApiResponse<IncomeListResponse>>('/management/income', {
    params,
  });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to retrieve income records');
  }

  return response.data.data;
};

export const fetchIncomeById = async (id: string): Promise<IncomeRecord> => {
  const response = await apiClient.get<ApiResponse<IncomeRecord>>(`/management/income/${id}`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to retrieve income details');
  }
  return response.data.data;
};

export const createIncome = async (data: CreateIncomeInput): Promise<IncomeRecord> => {
  const response = await apiClient.post<ApiResponse<IncomeRecord>>('/management/income', data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to create income record');
  }
  return response.data.data;
};

export const updateIncome = async (id: string, data: UpdateIncomeInput): Promise<IncomeRecord> => {
  const response = await apiClient.put<ApiResponse<IncomeRecord>>(`/management/income/${id}`, data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to update income record');
  }
  return response.data.data;
};

export const deleteIncome = async (id: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponse<{ id: string }>>(`/management/income/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to delete income record');
  }
};

export const bulkDeleteIncomes = async (ids: string[]): Promise<number> => {
  const response = await apiClient.post<ApiResponse<{ count: number }>>('/management/income/bulk-delete', { ids });
  if (!response.data.success || response.data.data === undefined) {
    throw new Error(response.data.message || 'Failed to bulk delete income records');
  }
  return response.data.data.count;
};

export const importIncomesFile = async (file: File): Promise<{ count: number; items: IncomeRecord[] }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<{ count: number; items: IncomeRecord[] }>>(
    '/management/income/import',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to import file');
  }

  return response.data.data;
};

export const downloadIncomeCsv = async (ids?: string[]): Promise<void> => {
  const params: Record<string, string> = {};
  if (ids && ids.length > 0) {
    params.ids = ids.join(',');
  }

  const response = await apiClient.get('/management/income/export/csv', {
    params,
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `income_report_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

