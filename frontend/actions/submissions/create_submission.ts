"use server";

import axios from "axios";

const BACKEND_API_URL = process.env.BACKEND_API_URL!;

interface CreateSubmissionProps {
  recipe_id: string;
  trial_id: string;
  participant_id: string;
  score: number;
  status?: "draft" | "saved";
  notes?: string;
  voice_memo_key?: string;
}

export const createSubmission = async ({
  recipe_id,
  trial_id,
  participant_id,
  score,
  status = "draft",
  notes,
  voice_memo_key,
}: CreateSubmissionProps): Promise<{ message: string; data: any }> => {
  try {
    const response = await axios.post(
      `${BACKEND_API_URL}/submission`,
      {
        recipe_id,
        trial_id,
        participant_id,
        score,
        status,
        notes,
        voice_memo_key,
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
    console.error("Error creating submission:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        throw new Error(
          `Invalid request: ${
            error.response?.data?.message || "Required fields are missing"
          }`
        );
      } else if (error.response?.status === 403) {
        throw new Error("Access denied to create submission");
      } else if (error.response?.status === 500) {
        throw new Error(
          `Failed to create submission: ${
            error.response?.data?.message || error.message
          }`
        );
      } else {
        throw new Error(
          `Failed to create submission: ${
            error.response?.data?.error || error.message
          }`
        );
      }
    }

    throw new Error("Network error occurred while creating submission");
  }
};

