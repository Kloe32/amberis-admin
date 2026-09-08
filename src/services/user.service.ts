import axiosInstance from "../config/axiosInstance";
import { API_ROUTES } from "../config/config";

const addUser = async (userData: any) => {
  try {
    console.log(userData);
    const { data } = await axiosInstance.post(API_ROUTES.ADD_USER, userData);
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to add user",
    );
  }
};

const getUsers = async () => {
  try {
    const { data } = await axiosInstance.get(API_ROUTES.GET_USERS);
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch users",
    );
  }
};

export { addUser, getUsers };
