"use server";

import axios from "axios";
import { getAuthHeaders } from "@/lib/getAuthHeaders";

const BACKEND_API_URL = process.env.BACKEND_API_URL!;

export const getTrials = async (): Promise<{
  message: string;
  data: any[];
  count: number;
}> => {

  try {
    const authHeaders = await getAuthHeaders();
    const response = await axios.get(`${BACKEND_API_URL}/trial`, {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
    });

    const data = response.data;

    return data;
  } catch (error) {
    console.error("Error getting trials:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error("Access denied to get trials");
      } else if (error.response?.status === 500) {
        throw new Error(
          `Failed to get trials: ${
            error.response?.data?.message || error.message
          }`
        );
      } else {
        throw new Error(
          `Failed to get trials: ${
            error.response?.data?.error || error.message
          }`
        );
      }
    }

    throw new Error("Network error occurred while getting trials");
  }
};

