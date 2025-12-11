export interface Recipe {
  recipe_id: string;
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

