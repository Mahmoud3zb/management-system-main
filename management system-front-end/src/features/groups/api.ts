import apiClient from "../../services/apiClient";
import type { Group, User, ApiResponse, AcademicLevel } from "../../types";

export interface GetGroupsParams {
  level?: AcademicLevel;
  page?: number;
  limit?: number;
}

export interface CreateGroupPayload {
  name: string;
  level: AcademicLevel;
}

export interface UpdateGroupPayload {
  name?: string;
  level?: AcademicLevel;
}

export const getGroupsApi = async (params?: GetGroupsParams): Promise<ApiResponse<Group[]>> => {
  const response = await apiClient.get<ApiResponse<Group[]>>("/api/group", { params });
  return response.data;
};

export const getGroupByIdApi = async (id: string): Promise<ApiResponse<Group>> => {
  const response = await apiClient.get<ApiResponse<Group>>(`/api/group/${id}`);
  return response.data;
};

export const getGroupStudentsApi = async (groupId: string): Promise<ApiResponse<User[]>> => {
  const response = await apiClient.get<ApiResponse<User[]>>(`/api/group/${groupId}/students`);
  return response.data;
};

export const createGroupApi = async (payload: CreateGroupPayload): Promise<ApiResponse<Group>> => {
  const response = await apiClient.post<ApiResponse<Group>>("/api/group", payload);
  return response.data;
};

export const updateGroupApi = async (id: string, payload: UpdateGroupPayload): Promise<ApiResponse<Group>> => {
  const response = await apiClient.put<ApiResponse<Group>>(`/api/group/${id}`, payload);
  return response.data;
};

export const deleteGroupApi = async (id: string): Promise<ApiResponse<{ group: Group; affectedStudentsCount: number }>> => {
  const response = await apiClient.delete<ApiResponse<{ group: Group; affectedStudentsCount: number }>>(`/api/group/${id}`);
  return response.data;
};
