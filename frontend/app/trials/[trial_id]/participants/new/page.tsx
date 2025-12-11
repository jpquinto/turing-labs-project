'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createParticipant } from '@/actions/participants';

export default function NewParticipantPage() {
  const router = useRouter();
  const params = useParams();
  const trialId = params.trial_id as string;

  const [formData, setFormData] = useState({
    name: '',
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
    if (!formData.name.trim()) {
      setError('Participant name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createParticipant({
        trial_id: trialId,
        name: formData.name,
      });

      router.push(`/trials/${trialId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create participant');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            onClick={() => router.push(`/trials/${trialId}`)}
            variant="ghost"
            className="mb-4"
          >
            ← Back to Trial
          </Button>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
            Add New Participant
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Create a new participant for this trial
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Participant Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* Participant Name */}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-zinc-900 dark:text-white"
                >
                  Participant Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter participant name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full"
                />
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  A unique 6-digit code will be automatically generated
                </p>
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
                  {loading ? 'Creating...' : 'Create Participant'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

