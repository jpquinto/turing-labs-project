"use server";

import axios from "axios";

const BACKEND_API_URL = process.env.BACKEND_API_URL!;

interface GetSubmissionsByRecipeProps {
  recipe_id: string;
}

export const getSubmissionsByRecipe = async ({
  recipe_id,
}: GetSubmissionsByRecipeProps): Promise<{
  message: string;
  data: any[];
  count: number;
}> => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/submission?recipe_id=${encodeURIComponent(recipe_id)}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;

    return data;
  } catch (error) {
    console.error("Error getting submissions by recipe:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        throw new Error(
          `Invalid request: ${
            error.response?.data?.error || "Recipe ID is required"
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

