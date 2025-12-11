'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trial, Recipe, Submission } from '@/types';
import { getTrial } from '@/actions/trials';
import { getRecipesByTrial } from '@/actions/recipes';
import { getSubmissionsByTrial } from '@/actions/submissions';

export default function TrialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const trialId = params.trial_id as string;

  const [trial, setTrial] = useState<Trial | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrialData();
  }, [trialId]);

  const loadTrialData = async () => {
    try {
      setLoading(true);
      const [trialResponse, recipesResponse, submissionsResponse] = await Promise.all([
        getTrial({ trial_id: trialId }),
        getRecipesByTrial({ trial_id: trialId }),
        getSubmissionsByTrial({ trial_id: trialId })
      ]);
      setTrial(trialResponse.data);
      setRecipes(recipesResponse.data);
      setSubmissions(submissionsResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to load trial data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-zinc-600 dark:text-zinc-400">Loading trial...</p>
        </main>
      </div>
    );
  }

  if (error || !trial) {
    return (
      <div className="min-h-screen">
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error || 'Trial not found'}</p>
          </div>
          <Button onClick={() => router.push('/trials')} className="mt-4" variant="outline">
            ← Back to Trials
          </Button>
        </main>
      </div>
    );
  }

  const completedSubmissions = submissions.filter(s => s.status === 'saved').length;
  const completionRate = recipes.length > 0 
    ? Math.round((completedSubmissions / (recipes.length * 4)) * 100) 
    : 0;

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button onClick={() => router.push('/trials')} variant="ghost" className="mb-4">
            ← Back to Trials
          </Button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
                Trial {trial.trial_id.slice(0, 8)}
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                {new Date(trial.trial_date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={trial.status === 'active' ? 'default' : 'secondary'} className="text-base px-4 py-2">
                {trial.status}
              </Badge>
              <Button onClick={() => router.push(`/trials/${trialId}/session`)}>
                Start Testing Session
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardDescription>Recipes</CardDescription>
              <CardTitle className="text-3xl">{recipes.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Total formulations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Submissions</CardDescription>
              <CardTitle className="text-3xl">{submissions.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {completedSubmissions} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Progress</CardDescription>
              <CardTitle className="text-3xl">{completionRate}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all" 
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recipes Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Recipes
            </h2>
            <Button variant="outline">Add Recipe</Button>
          </div>

          {recipes.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-zinc-600 dark:text-zinc-400 py-8">
                  No recipes added yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe) => (
                <Link key={recipe.recipe_id} href={`/recipes/${recipe.recipe_id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg">{recipe.recipe_name}</CardTitle>
                      <CardDescription>ID: {recipe.recipe_id.slice(0, 8)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-zinc-600 dark:text-zinc-400">Sugar:</span>
                          <span className="font-medium">{recipe.sugar}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-600 dark:text-zinc-400">Reduction:</span>
                          <Badge variant="secondary">
                            {recipe.target_sugar_reduction_percent}%
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-600 dark:text-zinc-400">Cost:</span>
                          <span className="font-medium">${recipe.target_cost_per_unit.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        <Separator className="my-8" />

        {/* Submissions Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Recent Submissions
            </h2>
            <Button variant="outline" onClick={() => router.push('/submissions')}>
              View All
            </Button>
          </div>

          {submissions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-zinc-600 dark:text-zinc-400 py-8">
                  No submissions yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {submissions.slice(0, 10).map((submission) => (
                    <div key={submission.submission_id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">
                          Participant {submission.participant_id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          Recipe {submission.recipe_id.slice(0, 8)} • Score: {submission.score}/10
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={submission.status === 'saved' ? 'default' : 'secondary'}>
                          {submission.status}
                        </Badge>
                        <Link href={`/submissions/${submission.submission_id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
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

