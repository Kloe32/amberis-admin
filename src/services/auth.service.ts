import axiosInstance from "../config/axiosInstance";
import type { LoginPayload, LoginResponse } from "../types/auth.type";
import { API_ROUTES } from "../config/config";

export const authenticateAdmin = async (
  payload: LoginPayload,
): Promise<LoginResponse> => {
  try {
    const { data } = await axiosInstance.post<LoginResponse>(
      API_ROUTES.LOGIN_URL,
      payload,
    );
    console.log(data);
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Authentication failed",
    );
  }
};
