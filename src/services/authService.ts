import { apiClient } from './api';
import { 
  ApiResponse, 
  AuthResponseData, 
  LoginCredentials, 
  User, 
  UpdateProfileInput, 
  ChangePasswordInput 
} from '../types';

export const loginAdmin = async (credentials: LoginCredentials): Promise<AuthResponseData> => {
  const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', credentials);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Login failed');
  }
  return response.data.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
  if (!response.data.success || !response.data.data?.user) {
    throw new Error(response.data.message || 'Failed to fetch current user');
  }
  return response.data.data.user;
};

export const updateProfile = async (data: UpdateProfileInput): Promise<User> => {
  const response = await apiClient.put<ApiResponse<{ user: User }>>('/auth/profile', data);
  if (!response.data.success || !response.data.data?.user) {
    throw new Error(response.data.message || 'Failed to update profile');
  }
  return response.data.data.user;
};

export const changePassword = async (data: ChangePasswordInput): Promise<void> => {
  const response = await apiClient.put<ApiResponse<null>>('/auth/change-password', data);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to change password');
  }
};

export const logoutAdmin = async (): Promise<void> => {
  await apiClient.post<ApiResponse<null>>('/auth/logout');
};
