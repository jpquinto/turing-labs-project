"use server";

import axios from "axios";

const BACKEND_API_URL = process.env.BACKEND_API_URL!;

interface GetTrialProps {
  trial_id: string;
}

export const getTrial = async ({
  trial_id,
}: GetTrialProps): Promise<{ message: string; data: any }> => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/trial/${trial_id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = response.data;

    return data;
  } catch (error) {
    console.error("Error getting trial:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        throw new Error(
          `Invalid request: ${
            error.response?.data?.error || "Trial ID is required"
          }`
        );
      } else if (error.response?.status === 404) {
        throw new Error(
          `Trial not found: ${
            error.response?.data?.message || "No trial found with this ID"
          }`
        );
      } else if (error.response?.status === 403) {
        throw new Error("Access denied to get trial");
      } else if (error.response?.status === 500) {
        throw new Error(
          `Failed to get trial: ${
            error.response?.data?.message || error.message
          }`
        );
      } else {
        throw new Error(
          `Failed to get trial: ${error.response?.data?.error || error.message}`
        );
      }
    }

    throw new Error("Network error occurred while getting trial");
  }
};
