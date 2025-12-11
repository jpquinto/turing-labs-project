'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Submission } from '@/types';
import { getSubmissions } from '@/actions/submissions';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'saved' | 'draft'>('all');

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const response = await getSubmissions();
      setSubmissions(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load submissions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(s => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  const savedCount = submissions.filter(s => s.status === 'saved').length;
  const draftCount = submissions.filter(s => s.status === 'draft').length;
  const avgScore = submissions.length > 0
    ? submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length
    : 0;

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
            Submissions
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Participant taste test submissions and scores
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4 mb-8">
          <Card>
            <CardHeader>
              <CardDescription>Total Submissions</CardDescription>
              <CardTitle className="text-3xl">{submissions.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                All submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Saved</CardDescription>
              <CardTitle className="text-3xl">{savedCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Completed submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Drafts</CardDescription>
              <CardTitle className="text-3xl">{draftCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                In progress
              </p>
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
                Overall rating
              </p>
            </CardContent>
          </Card>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">Loading submissions...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {!loading && !error && submissions.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-zinc-600 dark:text-zinc-400 py-8">
                No submissions found.
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && submissions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>All Submissions</CardTitle>
                  <CardDescription>{filteredSubmissions.length} submissions</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={filter === 'all' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button 
                    variant={filter === 'saved' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFilter('saved')}
                  >
                    Saved
                  </Button>
                  <Button 
                    variant={filter === 'draft' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFilter('draft')}
                  >
                    Drafts
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Recipe</TableHead>
                    <TableHead>Trial</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.submission_id}>
                      <TableCell className="font-mono text-sm">
                        {submission.participant_id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {submission.recipe_id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {submission.trial_id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-lg font-semibold">{submission.score}/10</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={submission.status === 'saved' ? 'default' : 'secondary'}>
                          {submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-zinc-600 dark:text-zinc-400">
                        {new Date(submission.last_updated).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/submissions/${submission.submission_id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

