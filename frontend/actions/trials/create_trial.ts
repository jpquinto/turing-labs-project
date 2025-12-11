"use server";

import axios from "axios";

const BACKEND_API_URL = process.env.BACKEND_API_URL!;

interface CreateTrialProps {
  trial_name: string;
  status: string;
  trial_date: string;
}

export const createTrial = async ({
  trial_name,
  status,
  trial_date,
}: CreateTrialProps): Promise<{ message: string; data: any }> => {
  try {
    const response = await axios.post(
      `${BACKEND_API_URL}/trial`,
      {
        trial_name,
        status,
        trial_date,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;

    return data;
  } catch (error) {
    console.error("Error creating trial:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        throw new Error(
          `Invalid request: ${
            error.response?.data?.message || "Required fields are missing"
          }`
        );
      } else if (error.response?.status === 403) {
        throw new Error("Access denied to create trial");
      } else if (error.response?.status === 500) {
        throw new Error(
          `Failed to create trial: ${
            error.response?.data?.message || error.message
          }`
        );
      } else {
        throw new Error(
          `Failed to create trial: ${
            error.response?.data?.error || error.message
          }`
        );
      }
    }

    throw new Error("Network error occurred while creating trial");
  }
};

