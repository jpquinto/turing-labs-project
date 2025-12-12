"use server";

import axios from "axios";
import { getAuthHeaders } from "@/lib/getAuthHeaders";

const BACKEND_API_URL = process.env.BACKEND_API_URL!;

interface CreateRecipeProps {
  trial_id: string;
  recipe_name: string;
  sugar: number;
  stevia_extract: number;
  allulose: number;
  citric_acid: number;
  target_sugar_reduction_percent: number;
  target_cost_per_unit: number;
  prediction?: string;
}

export const createRecipe = async ({
  trial_id,
  recipe_name,
  sugar,
  stevia_extract,
  allulose,
  citric_acid,
  target_sugar_reduction_percent,
  target_cost_per_unit,
  prediction = "",
}: CreateRecipeProps): Promise<{ message: string; data: any }> => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await axios.post(
      `${BACKEND_API_URL}/recipe`,
      {
        trial_id,
        recipe_name,
        sugar,
        stevia_extract,
        allulose,
        citric_acid,
        target_sugar_reduction_percent,
        target_cost_per_unit,
        prediction,
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
    console.error("Error creating recipe:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        throw new Error(
          `Invalid request: ${
            error.response?.data?.message || "Required fields are missing"
          }`
        );
      } else if (error.response?.status === 403) {
        throw new Error("Access denied to create recipe");
      } else if (error.response?.status === 500) {
        throw new Error(
          `Failed to create recipe: ${
            error.response?.data?.message || error.message
          }`
        );
      } else {
        throw new Error(
          `Failed to create recipe: ${
            error.response?.data?.error || error.message
          }`
        );
      }
    }

    throw new Error("Network error occurred while creating recipe");
  }
};

