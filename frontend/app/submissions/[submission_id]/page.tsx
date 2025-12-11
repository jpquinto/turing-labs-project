'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Submission } from '@/types';
import { getSubmission } from '@/actions/submissions';

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.submission_id as string;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubmissionData();
  }, [submissionId]);

  const loadSubmissionData = async () => {
    try {
      setLoading(true);
      // Note: getSubmission requires both submission_id and recipe_id (composite key)
      // For now, we'll need to get the recipe_id from the URL params or from a list
      // TODO: Update URL structure to /submissions/[submission_id]/[recipe_id] or use a different lookup method
      // const submissionResponse = await getSubmission({ submission_id: submissionId, recipe_id: recipeId });
      // setSubmission(submissionResponse.data);
      
      // Temporary: Set error until we have the recipe_id
      setError('Submission detail page requires recipe_id. Navigate from a trial or participant to view submission details.');
      setSubmission(null);
    } catch (err) {
      setError('Failed to load submission data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-zinc-600 dark:text-zinc-400">Loading submission...</p>
        </main>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen">
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error || 'Submission not found'}</p>
          </div>
          <Button onClick={() => router.push('/submissions')} className="mt-4" variant="outline">
            ← Back to Submissions
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button onClick={() => router.push('/submissions')} variant="ghost" className="mb-4">
            ← Back to Submissions
          </Button>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
                  Submission Details
                </h1>
                <Badge variant={submission.status === 'saved' ? 'default' : 'secondary'} className="text-lg px-3 py-1">
                  {submission.status}
                </Badge>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400">
                ID: {submission.submission_id}
              </p>
            </div>
          </div>
        </div>

        {/* Score Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Score</CardTitle>
            <CardDescription>Overall rating for this recipe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="text-6xl font-bold text-blue-600 dark:text-blue-400">
                {submission.score}
              </div>
              <div className="text-4xl text-zinc-400 dark:text-zinc-600">/10</div>
              <div className="flex-1">
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-4">
                  <div 
                    className="bg-blue-600 h-4 rounded-full transition-all" 
                    style={{ width: `${(submission.score / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Information */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardDescription>Participant</CardDescription>
              <CardTitle className="text-lg font-mono">
                {submission.participant_id.slice(0, 8)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/participants/${submission.participant_id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Participant
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Recipe</CardDescription>
              <CardTitle className="text-lg font-mono">
                {submission.recipe_id.slice(0, 8)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/recipes/${submission.recipe_id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Recipe
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Trial</CardDescription>
              <CardTitle className="text-lg font-mono">
                {submission.trial_id.slice(0, 8)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/trials/${submission.trial_id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Trial
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Metadata */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Submission Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-600 dark:text-zinc-400">Status:</span>
              <Badge variant={submission.status === 'saved' ? 'default' : 'secondary'}>
                {submission.status}
              </Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-zinc-600 dark:text-zinc-400">Last Updated:</span>
              <span className="font-medium text-zinc-900 dark:text-white">
                {new Date(submission.last_updated).toLocaleString()}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-zinc-600 dark:text-zinc-400">Submission ID:</span>
              <span className="font-mono text-sm text-zinc-900 dark:text-white">
                {submission.submission_id}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {submission.notes && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Participant feedback and observations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {submission.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Voice Memo */}
        {submission.voice_memo_key && (
          <Card>
            <CardHeader>
              <CardTitle>Voice Memo</CardTitle>
              <CardDescription>Audio recording from participant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
                <Button size="icon" className="rounded-full">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path>
                  </svg>
                </Button>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">Voice Recording</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Key: {submission.voice_memo_key}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

