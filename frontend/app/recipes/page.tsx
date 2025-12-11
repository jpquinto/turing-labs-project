'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Recipe } from '@/types';
import { getRecipes } from '@/actions/recipes';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const response = await getRecipes();
      setRecipes(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load recipes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
              Recipes
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Sugar reduction recipe formulations
            </p>
          </div>
          <Button>Create New Recipe</Button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">Loading recipes...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {!loading && !error && recipes.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-zinc-600 dark:text-zinc-400 py-8">
                No recipes found. Create your first recipe to get started.
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && recipes.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <Link key={recipe.recipe_id} href={`/recipes/${recipe.recipe_id}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle>{recipe.recipe_name}</CardTitle>
                    <CardDescription>ID: {recipe.recipe_id.slice(0, 8)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                          Ingredients
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-zinc-600 dark:text-zinc-400">Sugar:</span>
                            <span className="font-medium">{recipe.sugar}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-600 dark:text-zinc-400">Stevia:</span>
                            <span className="font-medium">{recipe.stevia_extract}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-600 dark:text-zinc-400">Allulose:</span>
                            <span className="font-medium">{recipe.allulose}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-600 dark:text-zinc-400">Citric Acid:</span>
                            <span className="font-medium">{recipe.citric_acid}g</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between">
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Reduction</p>
                          <Badge variant="secondary" className="mt-1">
                            {recipe.target_sugar_reduction_percent}%
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Cost/Unit</p>
                          <p className="text-lg font-semibold text-zinc-900 dark:text-white mt-1">
                            ${recipe.target_cost_per_unit.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

