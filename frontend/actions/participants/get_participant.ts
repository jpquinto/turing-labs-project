"use server";

import axios from "axios";
import { getAuthHeaders } from "@/lib/getAuthHeaders";

const BACKEND_API_URL = process.env.BACKEND_API_URL!;

interface GetParticipantProps {
  participant_id: string;
}

export const getParticipant = async ({
  participant_id,
}: GetParticipantProps): Promise<{ message: string; data: any }> => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await axios.get(
      `${BACKEND_API_URL}/participant/${participant_id}`,
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
    console.error("Error getting participant:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        throw new Error(
          `Invalid request: ${
            error.response?.data?.error || "Participant ID is required"
          }`
        );
      } else if (error.response?.status === 404) {
        throw new Error(
          `Participant not found: ${
            error.response?.data?.message ||
            "No participant found with this ID"
          }`
        );
      } else if (error.response?.status === 403) {
        throw new Error("Access denied to get participant");
      } else if (error.response?.status === 500) {
        throw new Error(
          `Failed to get participant: ${
            error.response?.data?.message || error.message
          }`
        );
      } else {
        throw new Error(
          `Failed to get participant: ${
            error.response?.data?.error || error.message
          }`
        );
      }
    }

    throw new Error("Network error occurred while getting participant");
  }
};

