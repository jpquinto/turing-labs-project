'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createRecipe } from '@/actions/recipes';

export default function NewRecipePage() {
  const router = useRouter();
  const params = useParams();
  const trialId = params.trial_id as string;

  const [formData, setFormData] = useState({
    recipe_name: '',
    sugar: '',
    stevia_extract: '',
    allulose: '',
    citric_acid: '',
    target_sugar_reduction_percent: '',
    target_cost_per_unit: '',
    prediction: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.recipe_name.trim()) {
      setError('Recipe name is required');
      return;
    }

    const numericFields = [
      'sugar',
      'stevia_extract',
      'allulose',
      'citric_acid',
      'target_sugar_reduction_percent',
      'target_cost_per_unit',
    ];

    for (const field of numericFields) {
      if (!formData[field as keyof typeof formData]) {
        setError(`${field.replace(/_/g, ' ')} is required`);
        return;
      }
      if (isNaN(Number(formData[field as keyof typeof formData]))) {
        setError(`${field.replace(/_/g, ' ')} must be a valid number`);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      await createRecipe({
        trial_id: trialId,
        recipe_name: formData.recipe_name,
        sugar: Number(formData.sugar),
        stevia_extract: Number(formData.stevia_extract),
        allulose: Number(formData.allulose),
        citric_acid: Number(formData.citric_acid),
        target_sugar_reduction_percent: Number(formData.target_sugar_reduction_percent),
        target_cost_per_unit: Number(formData.target_cost_per_unit),
        prediction: formData.prediction,
      });

      router.push(`/trials/${trialId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create recipe');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            onClick={() => router.push(`/trials/${trialId}`)}
            variant="ghost"
            className="mb-4"
          >
            ← Back to Trial
          </Button>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
            Add New Recipe
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Create a new recipe formulation for this trial
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recipe Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* Recipe Name */}
              <div className="space-y-2">
                <label
                  htmlFor="recipe_name"
                  className="block text-sm font-medium text-zinc-900 dark:text-white"
                >
                  Recipe Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="recipe_name"
                  name="recipe_name"
                  type="text"
                  placeholder="Enter recipe name"
                  value={formData.recipe_name}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full"
                />
              </div>

              {/* Ingredients Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Ingredients (grams)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="sugar"
                      className="block text-sm font-medium text-zinc-900 dark:text-white"
                    >
                      Sugar (g) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="sugar"
                      name="sugar"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.sugar}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="stevia_extract"
                      className="block text-sm font-medium text-zinc-900 dark:text-white"
                    >
                      Stevia Extract (g) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="stevia_extract"
                      name="stevia_extract"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.stevia_extract}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="allulose"
                      className="block text-sm font-medium text-zinc-900 dark:text-white"
                    >
                      Allulose (g) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="allulose"
                      name="allulose"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.allulose}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="citric_acid"
                      className="block text-sm font-medium text-zinc-900 dark:text-white"
                    >
                      Citric Acid (g) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="citric_acid"
                      name="citric_acid"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.citric_acid}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Targets Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Targets
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="target_sugar_reduction_percent"
                      className="block text-sm font-medium text-zinc-900 dark:text-white"
                    >
                      Sugar Reduction (%) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="target_sugar_reduction_percent"
                      name="target_sugar_reduction_percent"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.target_sugar_reduction_percent}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="target_cost_per_unit"
                      className="block text-sm font-medium text-zinc-900 dark:text-white"
                    >
                      Cost Per Unit ($) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="target_cost_per_unit"
                      name="target_cost_per_unit"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.target_cost_per_unit}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Prediction (Optional) */}
              <div className="space-y-2">
                <label
                  htmlFor="prediction"
                  className="block text-sm font-medium text-zinc-900 dark:text-white"
                >
                  Prediction (Optional)
                </label>
                <Input
                  id="prediction"
                  name="prediction"
                  type="text"
                  placeholder="Enter prediction"
                  value={formData.prediction}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/trials/${trialId}`)}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Recipe'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

