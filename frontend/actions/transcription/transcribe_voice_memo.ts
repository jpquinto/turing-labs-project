"use server";

import axios from "axios";
import { getAuthHeaders } from "@/lib/getAuthHeaders";

const BACKEND_API_URL = process.env.BACKEND_API_URL!;

interface TranscribeVoiceMemoProps {
  submission_id: string;
  voice_memo_key: string;
  recipe_id: string;
}

export const transcribeVoiceMemo = async ({
  submission_id,
  voice_memo_key,
  recipe_id,
}: TranscribeVoiceMemoProps): Promise<{
  message: string;
  submission_id: string;
  transcription: string;
}> => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await axios.post(
      `${BACKEND_API_URL}/transcribe`,
      {
        submission_id,
        voice_memo_key,
        recipe_id,
      },
      {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        timeout: 360000, // 6 minutes timeout (transcription can take up to 5 minutes)
      }
    );

    const data = response.data;

    return data;
  } catch (error) {
    console.error("Error transcribing voice memo:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        throw new Error(
          `Invalid request: ${
            error.response?.data?.message || "Required fields are missing"
          }`
        );
      } else if (error.response?.status === 504) {
        throw new Error(
          "Transcription timed out. The audio file may be too long or the service is busy."
        );
      } else if (error.response?.status === 500) {
        throw new Error(
          `Transcription failed: ${
            error.response?.data?.message || error.message
          }`
        );
      } else if (error.code === "ECONNABORTED") {
        throw new Error(
          "Request timed out. The transcription is taking longer than expected."
        );
      } else {
        throw new Error(
          `Failed to transcribe: ${
            error.response?.data?.error || error.message
          }`
        );
      }
    }

    throw new Error("Network error occurred while transcribing voice memo");
  }
};

