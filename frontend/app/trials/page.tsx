'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trial } from '@/types';
import { getTrials } from '@/actions/trials';

export default function TrialsPage() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrials();
  }, []);

  const loadTrials = async () => {
    try {
      setLoading(true);
      const response = await getTrials();
      setTrials(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load trials. Please try again.');
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
              Trials
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Manage taste test trials and experiments
            </p>
          </div>
          <Link href="/trials/new">
            <Button>
              Create New Trial
            </Button>
          </Link>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">Loading trials...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {!loading && !error && trials.length === 0 && (
          <Card>
            <CardContent>
              <p className="text-center text-zinc-600 dark:text-zinc-400 py-8">
                No trials found. Create your first trial to get started.
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && trials.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trials.map((trial) => (
              <Link key={trial.trial_id} href={`/trials/${trial.trial_id}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle>{trial.trial_name || `Trial ${trial.trial_id.slice(0, 8)}`}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Status:</span>
                        <Badge variant={trial.status === 'active' ? 'default' : 'secondary'}>
                          {trial.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Date:</span>
                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                          {new Date(trial.trial_date).toLocaleDateString()}
                        </span>
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

