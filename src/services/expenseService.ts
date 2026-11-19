import { apiClient } from './api';
import { 
  ApiResponse, 
  ExpenseFilterParams, 
  ExpenseListResponse, 
  ExpenseRecord, 
  CreateExpenseInput, 
  UpdateExpenseInput 
} from '../types';

export const fetchExpenses = async (params: ExpenseFilterParams = {}): Promise<ExpenseListResponse> => {
  const response = await apiClient.get<ApiResponse<ExpenseListResponse>>('/management/expense', {
    params,
  });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to retrieve expense records');
  }

  return response.data.data;
};

export const fetchExpenseById = async (id: string): Promise<ExpenseRecord> => {
  const response = await apiClient.get<ApiResponse<ExpenseRecord>>(`/management/expense/${id}`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to retrieve expense details');
  }
  return response.data.data;
};

export const createExpense = async (data: CreateExpenseInput): Promise<ExpenseRecord> => {
  const response = await apiClient.post<ApiResponse<ExpenseRecord>>('/management/expense', data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to create expense record');
  }
  return response.data.data;
};

export const updateExpense = async (id: string, data: UpdateExpenseInput): Promise<ExpenseRecord> => {
  const response = await apiClient.put<ApiResponse<ExpenseRecord>>(`/management/expense/${id}`, data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to update expense record');
  }
  return response.data.data;
};

export const deleteExpense = async (id: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponse<{ id: string }>>(`/management/expense/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to delete expense record');
  }
};

export const bulkDeleteExpenses = async (ids: string[]): Promise<number> => {
  const response = await apiClient.post<ApiResponse<{ count: number }>>('/management/expense/bulk-delete', { ids });
  if (!response.data.success || response.data.data === undefined) {
    throw new Error(response.data.message || 'Failed to bulk delete expense records');
  }
  return response.data.data.count;
};

export const importExpensesFile = async (file: File): Promise<{ count: number; items: ExpenseRecord[] }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<{ count: number; items: ExpenseRecord[] }>>(
    '/management/expense/import',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to import expense file');
  }

  return response.data.data;
};

export const downloadExpenseCsv = async (ids?: string[]): Promise<void> => {
  const params: Record<string, string> = {};
  if (ids && ids.length > 0) {
    params.ids = ids.join(',');
  }

  const response = await apiClient.get('/management/expense/export/csv', {
    params,
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expense_report_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

