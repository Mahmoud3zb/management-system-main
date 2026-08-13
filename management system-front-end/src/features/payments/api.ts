import apiClient from "../../services/apiClient";
import type {
  Payment,
  RecordPaymentPayload,
  GetGroupPaymentsParams,
  ApiResponse,
} from "../../types";


export const recordPaymentApi = async (
  groupID: string,
  payload: RecordPaymentPayload
): Promise<ApiResponse<Payment>> => {
  const response = await apiClient.put<ApiResponse<Payment>>(
    `/api/payment/record/${groupID}`,
    payload
  );
  return response.data;
};


export const getGroupPaymentsApi = async (
  groupID: string,
  params?: GetGroupPaymentsParams
): Promise<ApiResponse<Payment[]>> => {
  const response = await apiClient.get<ApiResponse<Payment[]>>(
    `/api/payment/group/${groupID}`,
    { params }
  );
  return response.data;
};


export const getPaymentByIdApi = async (paymentID: string): Promise<ApiResponse<Payment>> => {
  const response = await apiClient.get<ApiResponse<Payment>>(`/api/payment/${paymentID}`);
  return response.data;
};
