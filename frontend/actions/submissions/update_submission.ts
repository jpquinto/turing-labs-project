"use server";

import axios from "axios";
import { getAuthHeaders } from "@/lib/getAuthHeaders";

const BACKEND_API_URL = process.env.BACKEND_API_URL!;

interface UpdateSubmissionProps {
  submission_id: string;
  recipe_id: string;
  updates: {
    notes?: string;
    voice_memo_key?: string;
    score?: number;
    status?: "draft" | "saved";
  };
}

export const updateSubmission = async ({
  submission_id,
  recipe_id,
  updates,
}: UpdateSubmissionProps): Promise<{ message: string; data: any }> => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await axios.patch(
      `${BACKEND_API_URL}/submission/${submission_id}?recipe_id=${encodeURIComponent(recipe_id)}`,
      updates,
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
    console.error("Error updating submission:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        throw new Error(
          `Invalid request: ${
            error.response?.data?.message || "Invalid update data"
          }`
        );
      } else if (error.response?.status === 404) {
        throw new Error(
          `Submission not found: ${
            error.response?.data?.message ||
            "No submission found with these IDs"
          }`
        );
      } else if (error.response?.status === 403) {
        throw new Error("Access denied to update submission");
      } else if (error.response?.status === 500) {
        throw new Error(
          `Failed to update submission: ${
            error.response?.data?.message || error.message
          }`
        );
      } else {
        throw new Error(
          `Failed to update submission: ${
            error.response?.data?.error || error.message
          }`
        );
      }
    }

    throw new Error("Network error occurred while updating submission");
  }
};

