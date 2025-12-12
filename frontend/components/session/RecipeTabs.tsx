'use client';

import { Check } from 'lucide-react';
import type { Recipe } from '@/types';

interface RecipeTabsProps {
  recipes: Recipe[];
  currentRecipeIndex: number;
  onRecipeChange: (index: number) => void;
  isRecipeCompleted: (index: number) => boolean;
}

export default function RecipeTabs({
  recipes,
  currentRecipeIndex,
  onRecipeChange,
  isRecipeCompleted,
}: RecipeTabsProps) {
  return (
    <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
      {recipes.map((recipe, index) => {
        const isCompleted = isRecipeCompleted(index);
        const isPreviousCompleted =
          index === 0 || isRecipeCompleted(index - 1);
        const isDisabled = !isPreviousCompleted && index !== 0;
        const isCurrent = index === currentRecipeIndex;

        return (
          <button
            key={recipe.recipe_id}
            onClick={() => !isDisabled && onRecipeChange(index)}
            disabled={isDisabled}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              isCurrent
                ? "bg-blue-600 text-white border-2 border-blue-600 shadow-sm"
                : isCompleted
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-2 border-green-500 dark:border-green-700"
                : isDisabled
                ? "bg-zinc-100 dark:bg-zinc-900/50 text-zinc-400 dark:text-zinc-600 border-2 border-zinc-200 dark:border-zinc-800 cursor-not-allowed opacity-50"
                : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-2 border-zinc-200 dark:border-zinc-800 hover:border-blue-300"
            }`}
          >
            {isCompleted && <Check className="h-4 w-4" />}
            {recipe.recipe_name}
          </button>
        );
      })}
    </div>
  );
}

