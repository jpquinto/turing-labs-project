'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Save } from 'lucide-react';
import type { Recipe } from '@/types';

interface RecipeDetailsCardProps {
  recipe: Recipe;
  currentRecipeIndex: number;
  totalRecipes: number;
  hasChanges: boolean;
  allFieldsComplete: boolean;
  saving: { [key: string]: boolean };
  onPreviousRecipe: () => void;
  onSaveAsDraft: () => void;
  onSaveAndContinue: () => void;
}

export default function RecipeDetailsCard({
  recipe,
  currentRecipeIndex,
  totalRecipes,
  hasChanges,
  allFieldsComplete,
  saving,
  onPreviousRecipe,
  onSaveAsDraft,
  onSaveAndContinue,
}: RecipeDetailsCardProps) {
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>{recipe.recipe_name}</CardTitle>
        <CardDescription>
          ID: {recipe.recipe_id.slice(0, 8)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Formulation
          </label>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">
                Sugar
              </span>
              <span className="font-medium text-zinc-900 dark:text-white">
                {recipe.sugar}g
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">
                Stevia Extract
              </span>
              <span className="font-medium text-zinc-900 dark:text-white">
                {recipe.stevia_extract}g
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">
                Allulose
              </span>
              <span className="font-medium text-zinc-900 dark:text-white">
                {recipe.allulose}g
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">
                Citric Acid
              </span>
              <span className="font-medium text-zinc-900 dark:text-white">
                {recipe.citric_acid}g
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Target Metrics
          </label>
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">
                Sugar Reduction
              </span>
              <Badge
                className={
                  recipe.target_sugar_reduction_percent < 30
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-green-500 hover:bg-green-600"
                }
              >
                {recipe.target_sugar_reduction_percent}%
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">
                Cost per Unit
              </span>
              <Badge className="bg-blue-500 hover:bg-blue-600">
                ${recipe.target_cost_per_unit.toFixed(2)}
              </Badge>
            </div>
          </div>
        </div>

        {recipe.prediction && (
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Prediction
            </label>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {recipe.prediction}
            </div>
          </div>
        )}

        {/* Navigation and Save Buttons */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={onPreviousRecipe}
            disabled={currentRecipeIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous Recipe
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={onSaveAsDraft}
            disabled={saving["draft"] || !hasChanges}
          >
            {saving["draft"] ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </>
            )}
          </Button>

          <Button
            className="w-full"
            onClick={onSaveAndContinue}
            disabled={saving["continue"] || !allFieldsComplete}
          >
            {saving["continue"] ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {currentRecipeIndex < totalRecipes - 1
                  ? "Save & Continue"
                  : "Save & Finish"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

