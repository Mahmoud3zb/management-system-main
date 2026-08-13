import apiClient from "../../services/apiClient";
import type { User } from "../../types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
}

export const loginApi = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>("/api/auth/login", credentials);
  return response.data;
};
