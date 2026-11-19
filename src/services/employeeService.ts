import { apiClient } from './api';
import { 
  ApiResponse, 
  EmployeeRecord, 
  CreateEmployeeInput, 
  UpdateEmployeeInput, 
  EmployeeFilterParams, 
  EmployeeListResponse 
} from '../types';

export const fetchEmployees = async (params: EmployeeFilterParams = {}): Promise<EmployeeListResponse> => {
  const response = await apiClient.get<ApiResponse<EmployeeListResponse>>('/employees', {
    params,
  });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to retrieve employees');
  }

  return response.data.data;
};

export const fetchNextEmployeeId = async (): Promise<string> => {
  const response = await apiClient.get<ApiResponse<{ employeeId: string }>>('/employees/next-id');
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to generate next employee ID');
  }
  return response.data.data.employeeId;
};

export const fetchEmployeeById = async (id: string): Promise<EmployeeRecord> => {
  const response = await apiClient.get<ApiResponse<EmployeeRecord>>(`/employees/${id}`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to retrieve employee details');
  }
  return response.data.data;
};

export const createEmployee = async (data: CreateEmployeeInput): Promise<EmployeeRecord> => {
  const response = await apiClient.post<ApiResponse<EmployeeRecord>>('/employees', data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to create employee');
  }
  return response.data.data;
};

export const updateEmployee = async (id: string, data: UpdateEmployeeInput): Promise<EmployeeRecord> => {
  const response = await apiClient.put<ApiResponse<EmployeeRecord>>(`/employees/${id}`, data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to update employee');
  }
  return response.data.data;
};

export const deleteEmployee = async (id: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponse<{ id: string }>>(`/employees/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to delete employee');
  }
};

export const bulkDeleteEmployees = async (ids: string[]): Promise<number> => {
  const response = await apiClient.post<ApiResponse<{ count: number }>>('/employees/bulk-delete', { ids });
  if (!response.data.success || response.data.data === undefined) {
    throw new Error(response.data.message || 'Failed to bulk delete employees');
  }
  return response.data.data.count;
};

export const downloadEmployeesCsv = async (params: EmployeeFilterParams = {}): Promise<void> => {
  const response = await apiClient.get('/employees/export/csv', {
    params,
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `employees-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

