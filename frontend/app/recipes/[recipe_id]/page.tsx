'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Recipe, Submission } from '@/types';
import { getRecipe } from '@/actions/recipes';

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params.recipe_id as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecipeData();
  }, [recipeId]);

  const loadRecipeData = async () => {
    try {
      setLoading(true);
      // Note: getRecipe requires both recipe_id and trial_id (composite key)
      // For now, we'll need to get the trial_id from the URL params or from a list
      // TODO: Update URL structure to /recipes/[recipe_id]/[trial_id] or use a different lookup method
      // const recipeResponse = await getRecipe({ recipe_id: recipeId, trial_id: trialId });
      // setRecipe(recipeResponse.data);
      
      // Temporary: Set error until we have the trial_id
      setError('Recipe detail page requires trial_id. Navigate from a trial to view recipe details.');
      setRecipe(null);
      setSubmissions([]);
    } catch (err) {
      setError('Failed to load recipe data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-zinc-600 dark:text-zinc-400">Loading recipe...</p>
        </main>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen">
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error || 'Recipe not found'}</p>
          </div>
          <Button onClick={() => router.push('/recipes')} className="mt-4" variant="outline">
            ← Back to Recipes
          </Button>
        </main>
      </div>
    );
  }

  const avgScore = submissions.length > 0
    ? submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length
    : 0;

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button onClick={() => router.push('/recipes')} variant="ghost" className="mb-4">
            ← Back to Recipes
          </Button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
                {recipe.recipe_name}
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Recipe ID: {recipe.recipe_id}
              </p>
            </div>
            <Button>Edit Recipe</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardDescription>Average Score</CardDescription>
              <CardTitle className="text-3xl">
                {avgScore > 0 ? avgScore.toFixed(1) : '-'}/10
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                From {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Sugar Reduction</CardDescription>
              <CardTitle className="text-3xl">{recipe.target_sugar_reduction_percent}%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Target reduction
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Cost per Unit</CardDescription>
              <CardTitle className="text-3xl">${recipe.target_cost_per_unit.toFixed(2)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Production cost
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Formulation Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Formulation Details</CardTitle>
            <CardDescription>Ingredient composition</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Sugar</p>
                <p className="text-2xl font-semibold text-zinc-900 dark:text-white">{recipe.sugar}g</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Stevia Extract</p>
                <p className="text-2xl font-semibold text-zinc-900 dark:text-white">{recipe.stevia_extract}g</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Allulose</p>
                <p className="text-2xl font-semibold text-zinc-900 dark:text-white">{recipe.allulose}g</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Citric Acid</p>
                <p className="text-2xl font-semibold text-zinc-900 dark:text-white">{recipe.citric_acid}g</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {recipe.prediction && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>AI Prediction</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-700 dark:text-zinc-300">{recipe.prediction}</p>
            </CardContent>
          </Card>
        )}

        <Separator className="my-8" />

        {/* Submissions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Test Submissions
            </h2>
          </div>

          {submissions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-zinc-600 dark:text-zinc-400 py-8">
                  No submissions yet for this recipe.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div key={submission.submission_id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">
                          Participant {submission.participant_id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          Score: {submission.score}/10
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={submission.status === 'saved' ? 'default' : 'secondary'}>
                          {submission.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

