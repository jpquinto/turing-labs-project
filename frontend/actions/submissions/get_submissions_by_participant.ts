"use server";

import axios from "axios";
import { getAuthHeaders } from "@/lib/getAuthHeaders";

const BACKEND_API_URL = process.env.BACKEND_API_URL!;

interface GetSubmissionsByParticipantProps {
  participant_id: string;
}

export const getSubmissionsByParticipant = async ({
  participant_id,
}: GetSubmissionsByParticipantProps): Promise<{
  message: string;
  data: any[];
  count: number;
}> => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await axios.get(
      `${BACKEND_API_URL}/submission?participant_id=${encodeURIComponent(participant_id)}`,
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
    console.error("Error getting submissions by participant:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        throw new Error(
          `Invalid request: ${
            error.response?.data?.error || "Participant ID is required"
          }`
        );
      } else if (error.response?.status === 403) {
        throw new Error("Access denied to get submissions");
      } else if (error.response?.status === 500) {
        throw new Error(
          `Failed to get submissions: ${
            error.response?.data?.message || error.message
          }`
        );
      } else {
        throw new Error(
          `Failed to get submissions: ${
            error.response?.data?.error || error.message
          }`
        );
      }
    }

    throw new Error("Network error occurred while getting submissions");
  }
};

