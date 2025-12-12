"use server";

import axios from "axios";
import { getAuthHeaders } from "@/lib/getAuthHeaders";

const BACKEND_API_URL = process.env.BACKEND_API_URL!;

interface GetUploadUrlProps {
  file_name: string;
  content_type: string;
}

export const getVoiceMemoUploadUrl = async ({
  file_name,
  content_type,
}: GetUploadUrlProps): Promise<{
  message: string;
  data: {
    upload_url: string;
    s3_key: string;
    bucket: string;
    expires_in: number;
  };
}> => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await axios.post(
      `${BACKEND_API_URL}/voice-memo`,
      {
        file_name,
        content_type,
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
    console.error("Error getting voice memo upload URL:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        throw new Error(
          `Invalid request: ${
            error.response?.data?.message || "Required fields are missing"
          }`
        );
      } else if (error.response?.status === 403) {
        throw new Error("Access denied to get upload URL");
      } else if (error.response?.status === 500) {
        throw new Error(
          `Failed to get upload URL: ${
            error.response?.data?.message || error.message
          }`
        );
      } else {
        throw new Error(
          `Failed to get upload URL: ${
            error.response?.data?.error || error.message
          }`
        );
      }
    }

    throw new Error("Network error occurred while getting upload URL");
  }
};

