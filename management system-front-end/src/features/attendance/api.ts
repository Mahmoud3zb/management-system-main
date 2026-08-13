import apiClient from "../../services/apiClient";
import type { AttendanceSheet, ApiResponse } from "../../types";

export interface AttendanceStudentItem {
  studentID: string;
  isPresent: boolean;
}

export interface TakeAttendancePayload {
  date: string;
  present: AttendanceStudentItem[];
}

export interface GetAttendanceParams {
  page?: number;
  limit?: number;
}

/**
 * Record or update group attendance sheet (Backend uses upsert behavior)
 * POST /api/attendance/take-attendance/:groupID
 */
export const takeAttendanceApi = async (
  groupId: string,
  payload: TakeAttendancePayload
): Promise<ApiResponse<AttendanceSheet>> => {
  const response = await apiClient.post<ApiResponse<AttendanceSheet>>(
    `/api/attendance/take-attendance/${groupId}`,
    payload
  );
  return response.data;
};

/**
 * Get attendance sheets history for a specific group
 * GET /api/attendance/group/:groupID
 */
export const getGroupAttendanceApi = async (
  groupId: string,
  params?: GetAttendanceParams
): Promise<ApiResponse<AttendanceSheet[]>> => {
  const response = await apiClient.get<ApiResponse<AttendanceSheet[]>>(
    `/api/attendance/group/${groupId}`,
    { params }
  );
  return response.data;
};

/**
 * Get detailed attendance sheet by ID (returns populated student info)
 * GET /api/attendance/:id
 */
export const getAttendanceByIdApi = async (
  attendanceId: string
): Promise<ApiResponse<AttendanceSheet>> => {
  const response = await apiClient.get<ApiResponse<AttendanceSheet>>(
    `/api/attendance/${attendanceId}`
  );
  return response.data;
};
