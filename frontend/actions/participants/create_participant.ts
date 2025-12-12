"use server";

import axios from "axios";
import { getAuthHeaders } from "@/lib/getAuthHeaders";

const BACKEND_API_URL = process.env.BACKEND_API_URL!;

interface CreateParticipantProps {
  trial_id: string;
  name: string;
}

export const createParticipant = async ({
  trial_id,
  name,
}: CreateParticipantProps): Promise<{ message: string; data: any }> => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await axios.post(
      `${BACKEND_API_URL}/participant`,
      {
        trial_id,
        name,
      },
      {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
      }
    );

    const data = response.data;

    return data;
  } catch (error) {
    console.error("Error creating participant:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        throw new Error(
          `Invalid request: ${
            error.response?.data?.message || "Required fields are missing"
          }`
        );
      } else if (error.response?.status === 403) {
        throw new Error("Access denied to create participant");
      } else if (error.response?.status === 500) {
        throw new Error(
          `Failed to create participant: ${
            error.response?.data?.message || error.message
          }`
        );
      } else {
        throw new Error(
          `Failed to create participant: ${
            error.response?.data?.error || error.message
          }`
        );
      }
    }

    throw new Error("Network error occurred while creating participant");
  }
};

