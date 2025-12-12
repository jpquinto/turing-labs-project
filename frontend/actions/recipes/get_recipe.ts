"use server";

import axios from "axios";
import { getAuthHeaders } from "@/lib/getAuthHeaders";

const BACKEND_API_URL = process.env.BACKEND_API_URL!;

interface GetRecipeProps {
  recipe_id: string;
  trial_id: string;
}

export const getRecipe = async ({
  recipe_id,
  trial_id,
}: GetRecipeProps): Promise<{ message: string; data: any }> => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await axios.get(
      `${BACKEND_API_URL}/recipe/${recipe_id}/${trial_id}`,
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
    console.error("Error getting recipe:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        throw new Error(
          `Invalid request: ${
            error.response?.data?.error ||
            "Recipe ID and Trial ID are required"
          }`
        );
      } else if (error.response?.status === 404) {
        throw new Error(
          `Recipe not found: ${
            error.response?.data?.message || "No recipe found with these IDs"
          }`
        );
      } else if (error.response?.status === 403) {
        throw new Error("Access denied to get recipe");
      } else if (error.response?.status === 500) {
        throw new Error(
          `Failed to get recipe: ${
            error.response?.data?.message || error.message
          }`
        );
      } else {
        throw new Error(
          `Failed to get recipe: ${
            error.response?.data?.error || error.message
          }`
        );
      }
    }

    throw new Error("Network error occurred while getting recipe");
  }
};

