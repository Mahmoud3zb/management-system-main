import apiClient from "../../services/apiClient";
import type {
  Exam,
  CreateExamPayload,
  UpdateExamPayload,
  UpdateStudentMarkPayload,
  ApiResponse,
} from "../../types";

export interface GetGroupExamsParams {
  page?: number;
  limit?: number;
}


export const getGroupExamsApi = async (
  groupID: string,
  params?: GetGroupExamsParams
): Promise<ApiResponse<Exam[]>> => {
  const response = await apiClient.get<ApiResponse<Exam[]>>(`/api/exam/group/${groupID}`, {
    params,
  });
  return response.data;
};


export const getExamByIdApi = async (examID: string): Promise<ApiResponse<Exam>> => {
  const response = await apiClient.get<ApiResponse<Exam>>(`/api/exam/${examID}`);
  return response.data;
};


export const createExamApi = async (
  groupID: string,
  payload: CreateExamPayload
): Promise<ApiResponse<Exam>> => {
  const response = await apiClient.post<ApiResponse<Exam>>(`/api/exam/group/${groupID}`, payload);
  return response.data;
};


export const updateExamApi = async (
  examID: string,
  payload: UpdateExamPayload
): Promise<ApiResponse<Exam>> => {
  const response = await apiClient.put<ApiResponse<Exam>>(`/api/exam/${examID}`, payload);
  return response.data;
};


export const updateStudentMarkApi = async (
  examID: string,
  payload: UpdateStudentMarkPayload
): Promise<ApiResponse<Exam>> => {
  const response = await apiClient.put<ApiResponse<Exam>>(`/api/exam/student-mark/${examID}`, payload);
  return response.data;
};


export const deleteExamApi = async (examID: string): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/api/exam/${examID}`);
  return response.data;
};
