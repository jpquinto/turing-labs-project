'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Participant, Submission } from '@/types';
import { getParticipant } from '@/actions/participants';
import { getSubmissionsByParticipant } from '@/actions/submissions';

export default function ParticipantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const participantId = params.participant_id as string;

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadParticipantData();
  }, [participantId]);

  const loadParticipantData = async () => {
    try {
      setLoading(true);
      const [participantResponse, submissionsResponse] = await Promise.all([
        getParticipant({ participant_id: participantId }),
        getSubmissionsByParticipant({ participant_id: participantId })
      ]);
      setParticipant(participantResponse.data);
      setSubmissions(submissionsResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to load participant data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-zinc-600 dark:text-zinc-400">Loading participant...</p>
        </main>
      </div>
    );
  }

  if (error || !participant) {
    return (
      <div className="min-h-screen">
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error || 'Participant not found'}</p>
          </div>
          <Button onClick={() => router.push('/participants')} className="mt-4" variant="outline">
            ← Back to Participants
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
          <Button onClick={() => router.push('/participants')} variant="ghost" className="mb-4">
            ← Back to Participants
          </Button>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
                  Participant {participant.code}
                </h1>
                <Badge variant="outline" className="text-lg px-3 py-1">{participant.code}</Badge>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400">
                ID: {participant.participant_id}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4 mb-8">
          <Card>
            <CardHeader>
              <CardDescription>Tasks Assigned</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Total tasks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Tasks Completed</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Finished tasks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all" 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Average Score</CardDescription>
              <CardTitle className="text-3xl">
                {avgScore > 0 ? avgScore.toFixed(1) : '-'}/10
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Across all recipes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trial Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Trial Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Trial ID</p>
                <p className="text-lg font-mono text-zinc-900 dark:text-white">{participant.trial_id}</p>
              </div>
              <Link href={`/trials/${participant.trial_id}`}>
                <Button variant="outline">View Trial</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Submissions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Submissions
            </h2>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {submissions.map((submission) => (
                <Link key={submission.submission_id} href={`/submissions/${submission.submission_id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          Recipe {submission.recipe_id.slice(0, 8)}
                        </CardTitle>
                        <Badge variant={submission.status === 'saved' ? 'default' : 'secondary'}>
                          {submission.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        {new Date(submission.last_updated).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-zinc-600 dark:text-zinc-400">Score:</span>
                          <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                            {submission.score}/10
                          </span>
                        </div>
                        {submission.notes && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                            {submission.notes}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

