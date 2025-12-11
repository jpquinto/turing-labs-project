'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { createTrial } from '@/actions/trials';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function NewTrialPage() {
  const router = useRouter();
  const [trialName, setTrialName] = useState('');
  const [date, setDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trialName.trim()) {
      setError('Trial name is required');
      return;
    }
    
    if (!date) {
      setError('Trial date is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await createTrial({
        trial_name: trialName,
        status: 'pending',
        trial_date: format(date, 'yyyy-MM-dd'),
      });

      router.push('/trials');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trial');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
            Create New Trial
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Set up a new taste test trial
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Trial Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="trial-name"
                  className="block text-sm font-medium text-zinc-900 dark:text-white"
                >
                  Trial Name
                </label>
                <Input
                  id="trial-name"
                  type="text"
                  placeholder="Enter trial name"
                  value={trialName}
                  onChange={(e) => setTrialName(e.target.value)}
                  disabled={loading}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-900 dark:text-white">
                  Trial Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                      )}
                      disabled={loading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/trials')}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Creating...' : 'Create Trial'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

