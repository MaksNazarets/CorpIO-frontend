import { User } from "../types";
import { axiosInstance } from "../untils";

export const loginUser = async (username: string, password: string) => {
  try {
    const response = await axiosInstance.post("users/login", {
      username,
      password,
    });

    console.log("Login successful!", response.data);

    return response.data.user as User;
  } catch (error) {
    console.error("Login failed:", error);
    return null;
  }
};

export const logoutUser = async () => {
  try {
    const response = await axiosInstance.post("users/logout");

    if (response.status === 200) {
      console.log("User logged out");
      return true;
    } else {
      console.log(response);
      return false;
    }
  } catch (error) {
    console.error(error);
    alert("User logging out failed");
    return false;
  }
};
