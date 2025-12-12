"use server";

import axios from "axios";
import { getAuthHeaders } from "@/lib/getAuthHeaders";

const BACKEND_API_URL = process.env.BACKEND_API_URL!;

export const getRecipes = async (): Promise<{
  message: string;
  data: any[];
  count: number;
}> => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await axios.get(`${BACKEND_API_URL}/recipe`, {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
    });

    const data = response.data;

    return data;
  } catch (error) {
    console.error("Error getting recipes:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error("Access denied to get recipes");
      } else if (error.response?.status === 500) {
        throw new Error(
          `Failed to get recipes: ${
            error.response?.data?.message || error.message
          }`
        );
      } else {
        throw new Error(
          `Failed to get recipes: ${
            error.response?.data?.error || error.message
          }`
        );
      }
    }

    throw new Error("Network error occurred while getting recipes");
  }
};

