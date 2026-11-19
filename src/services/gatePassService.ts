import { apiClient } from './api';
import { 
  ApiResponse, 
  GatePassFilterParams, 
  GatePassListResponse, 
  GatePassRecord, 
  CreateGatePassInput, 
  UpdateGatePassInput 
} from '../types';

export const fetchGatePasses = async (params: GatePassFilterParams = {}): Promise<GatePassListResponse> => {
  const response = await apiClient.get<ApiResponse<GatePassListResponse>>('/billing/gate-passes', {
    params,
  });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to retrieve gate passes');
  }

  return response.data.data;
};

export const fetchNextGatePassNo = async (): Promise<string> => {
  const response = await apiClient.get<ApiResponse<{ passNo: string }>>('/billing/gate-passes/next-number');
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to generate next gate pass number');
  }
  return response.data.data.passNo;
};

export const fetchGatePassById = async (id: string): Promise<GatePassRecord> => {
  const response = await apiClient.get<ApiResponse<GatePassRecord>>(`/billing/gate-passes/${id}`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to retrieve gate pass details');
  }
  return response.data.data;
};

export const createGatePass = async (data: CreateGatePassInput): Promise<GatePassRecord> => {
  const response = await apiClient.post<ApiResponse<GatePassRecord>>('/billing/gate-passes', data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to create gate pass');
  }
  return response.data.data;
};

export const updateGatePass = async (id: string, data: UpdateGatePassInput): Promise<GatePassRecord> => {
  const response = await apiClient.put<ApiResponse<GatePassRecord>>(`/billing/gate-passes/${id}`, data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to update gate pass');
  }
  return response.data.data;
};

export const deleteGatePass = async (id: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponse<{ id: string }>>(`/billing/gate-passes/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to delete gate pass');
  }
};

export const bulkDeleteGatePasses = async (ids: string[]): Promise<number> => {
  const response = await apiClient.post<ApiResponse<{ count: number }>>('/billing/gate-passes/bulk-delete', { ids });
  if (!response.data.success || response.data.data === undefined) {
    throw new Error(response.data.message || 'Failed to bulk delete gate passes');
  }
  return response.data.data.count;
};

export const downloadGatePassCsv = async (params: GatePassFilterParams = {}): Promise<void> => {
  const response = await apiClient.get('/billing/gate-passes/export/csv', {
    params,
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `gate-passes-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

