"use server";

import axios from "axios";

const BACKEND_API_URL = process.env.BACKEND_API_URL!;

interface GetSubmissionProps {
  submission_id: string;
  recipe_id: string;
}

export const getSubmission = async ({
  submission_id,
  recipe_id,
}: GetSubmissionProps): Promise<{ message: string; data: any }> => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/submission/${submission_id}/${recipe_id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;

    return data;
  } catch (error) {
    console.error("Error getting submission:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        throw new Error(
          `Invalid request: ${
            error.response?.data?.error ||
            "Submission ID and Recipe ID are required"
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
        throw new Error("Access denied to get submission");
      } else if (error.response?.status === 500) {
        throw new Error(
          `Failed to get submission: ${
            error.response?.data?.message || error.message
          }`
        );
      } else {
        throw new Error(
          `Failed to get submission: ${
            error.response?.data?.error || error.message
          }`
        );
      }
    }

    throw new Error("Network error occurred while getting submission");
  }
};

