import apiClient from "../../services/apiClient";
import type { User, ApiResponse, AcademicLevel } from "../../types";

export interface AddStudentPayload {
  name: string;
  phone?: string;
  parentPhone?: string;
}

export const getStudentsByLevelApi = async (level: AcademicLevel): Promise<ApiResponse<User[]>> => {
  const response = await apiClient.get<ApiResponse<User[]>>("/api/userstudents");
  const filteredData = (response.data.data || []).filter((s) => s.level === level);
  return {
    ...response.data,
    data: filteredData,
  };
};

export const getStudentByIdApi = async (id: string): Promise<ApiResponse<User>> => {
  const response = await apiClient.get<ApiResponse<User>>(`/api/userstudent/${id}`);
  return response.data;
};

export const addStudentToGroupApi = async (groupId: string, payload: AddStudentPayload): Promise<ApiResponse<User>> => {
  const response = await apiClient.post<ApiResponse<User>>(`/api/user/add-student/${groupId}`, payload);
  return response.data;
};

export const deleteStudentApi = async (studentId: string): Promise<ApiResponse<User>> => {
  const response = await apiClient.delete<ApiResponse<User>>(`/api/user/${studentId}`);
  return response.data;
};
