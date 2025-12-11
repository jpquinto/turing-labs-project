'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Trial, Recipe, Participant } from '@/types';
import { getTrial } from '@/actions/trials';
import { getRecipesByTrial } from '@/actions/recipes';

export default function TestingSessionPage() {
  const params = useParams();
  const router = useRouter();
  const trialId = params.trial_id as string;

  const [trial, setTrial] = useState<Trial | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0);
  const [currentParticipant, setCurrentParticipant] = useState<string>('Participant 1');
  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessionData();
  }, [trialId]);

  const loadSessionData = async () => {
    try {
      const [trialResponse, recipesResponse] = await Promise.all([
        getTrial({ trial_id: trialId }),
        getRecipesByTrial({ trial_id: trialId })
      ]);
      setTrial(trialResponse.data);
      setRecipes(recipesResponse.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentRecipe = recipes[currentRecipeIndex];
  const outcomeTypes = ['Overall Taste', 'Sweetness Level', 'Texture Quality', 'Aftertaste'];

  const handleScoreChange = (outcome: string, value: number) => {
    const key = `${currentRecipeIndex}-${outcome}`;
    setScores({ ...scores, [key]: value });
  };

  const handleNotesChange = (outcome: string, value: string) => {
    const key = `${currentRecipeIndex}-${outcome}`;
    setNotes({ ...notes, [key]: value });
  };

  const handleNextRecipe = () => {
    if (currentRecipeIndex < recipes.length - 1) {
      setCurrentRecipeIndex(currentRecipeIndex + 1);
    } else {
      router.push(`/trials/${trialId}`);
    }
  };

  const handlePreviousRecipe = () => {
    if (currentRecipeIndex > 0) {
      setCurrentRecipeIndex(currentRecipeIndex - 1);
    }
  };

  if (loading || !trial || !currentRecipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading session...</p>
      </div>
    );
  }

  const completedOutcomes = outcomeTypes.filter(outcome => {
    const key = `${currentRecipeIndex}-${outcome}`;
    return scores[key] !== undefined;
  }).length;

  const progress = Math.round((completedOutcomes / outcomeTypes.length) * 100);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header Bar */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Testing Session</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
                Trial {trial.trial_id.slice(0, 8)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Progress Indicator */}
              <div className="flex items-center gap-3">
                <div className="text-sm">
                  <div className="font-medium text-zinc-900 dark:text-white">
                    {completedOutcomes} of {outcomeTypes.length} complete
                  </div>
                  <div className="text-zinc-500 dark:text-zinc-400">
                    Recipe {currentRecipeIndex + 1} of {recipes.length}
                  </div>
                </div>
              </div>
              <Button variant="outline" onClick={() => router.push(`/trials/${trialId}`)}>
                Exit Session
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Current Participant & Recipe Tabs */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className="px-4 py-2 text-sm">{currentParticipant}</Badge>
            <Button variant="ghost" size="sm">
              Switch participant →
            </Button>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Recipe {currentRecipeIndex + 1} of {recipes.length}
          </div>
        </div>

        {/* Recipe Tabs */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {recipes.map((recipe, index) => (
            <button
              key={recipe.recipe_id}
              onClick={() => setCurrentRecipeIndex(index)}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                index === currentRecipeIndex
                  ? 'bg-blue-600 text-white border-2 border-blue-600 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-2 border-zinc-200 dark:border-zinc-800 hover:border-blue-300'
              }`}
            >
              {recipe.recipe_name}
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recipe Details Card (Left) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>{currentRecipe.recipe_name}</CardTitle>
                <CardDescription>ID: {currentRecipe.recipe_id.slice(0, 8)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Formulation
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-700 dark:text-zinc-300">Sugar</span>
                      <span className="font-medium text-zinc-900 dark:text-white">{currentRecipe.sugar}g</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-700 dark:text-zinc-300">Stevia Extract</span>
                      <span className="font-medium text-zinc-900 dark:text-white">{currentRecipe.stevia_extract}g</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-700 dark:text-zinc-300">Allulose</span>
                      <span className="font-medium text-zinc-900 dark:text-white">{currentRecipe.allulose}g</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-700 dark:text-zinc-300">Citric Acid</span>
                      <span className="font-medium text-zinc-900 dark:text-white">{currentRecipe.citric_acid}g</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Target Metrics
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-700 dark:text-zinc-300">Sugar Reduction</span>
                      <Badge variant="secondary">{currentRecipe.target_sugar_reduction_percent}%</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-700 dark:text-zinc-300">Cost per Unit</span>
                      <Badge variant="secondary">${currentRecipe.target_cost_per_unit.toFixed(2)}</Badge>
                    </div>
                  </div>
                </div>

                {currentRecipe.prediction && (
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Prediction
                    </label>
                    <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {currentRecipe.prediction}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Measurement Entry Form (Right) */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Enter Your Measurements</CardTitle>
                <CardDescription>Rate each outcome on a scale of 1-10</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {outcomeTypes.map((outcome, idx) => {
                  const key = `${currentRecipeIndex}-${outcome}`;
                  const score = scores[key] || 5;
                  const note = notes[key] || '';
                  const isCompleted = scores[key] !== undefined;

                  return (
                    <div 
                      key={outcome}
                      className={`p-6 rounded-xl border-2 ${
                        isCompleted 
                          ? 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800' 
                          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-800'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{outcome}</h3>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            Rate the {outcome.toLowerCase()}
                          </p>
                        </div>
                        {isCompleted && (
                          <Badge>Saved</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                          <Input
                            type="range"
                            min="1"
                            max="10"
                            step="0.5"
                            value={score}
                            onChange={(e) => handleScoreChange(outcome, parseFloat(e.target.value))}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                            <span>1 - Poor</span>
                            <span>5 - Average</span>
                            <span>10 - Excellent</span>
                          </div>
                        </div>
                        <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400 min-w-[60px] text-center">
                          {score}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
                          Add Notes (Optional)
                        </label>
                        <textarea
                          rows={2}
                          value={note}
                          onChange={(e) => handleNotesChange(outcome, e.target.value)}
                          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                          placeholder="e.g., Good balance of flavors. Slightly less sweet than control..."
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handlePreviousRecipe}
                    disabled={currentRecipeIndex === 0}
                  >
                    ← Previous Recipe
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={handleNextRecipe}
                  >
                    {currentRecipeIndex < recipes.length - 1 
                      ? `Save & Continue to ${recipes[currentRecipeIndex + 1].recipe_name} →`
                      : 'Save & Finish Session'
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

