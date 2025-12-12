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
import { Participant } from '@/types';
import { getParticipants } from '@/actions/participants';

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadParticipants();
  }, []);

  const loadParticipants = async () => {
    try {
      setLoading(true);
      const response = await getParticipants();
      setParticipants(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load participants. Please try again.');
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
              Participants
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Trial participants and their assignments
            </p>
          </div>
          <Button>Add Participant</Button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">Loading participants...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {!loading && !error && participants.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-zinc-600 dark:text-zinc-400 py-8">
                No participants found. Add your first participant to get started.
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && participants.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>All Participants</CardTitle>
              <CardDescription>{participants.length} total participants</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Participant ID</TableHead>
                    <TableHead>Trial</TableHead>
                    <TableHead className="text-right">Tasks Assigned</TableHead>
                    <TableHead className="text-right">Tasks Completed</TableHead>
                    <TableHead className="text-right">Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant) => {

                    return (
                      <TableRow key={participant.participant_id}>
                        <TableCell className="font-medium">
                          <Badge variant="outline">{participant.code}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-zinc-600 dark:text-zinc-400">
                          {participant.participant_id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-zinc-600 dark:text-zinc-400">
                          {participant.trial_id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="text-right">{participant.tasks_completed}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/participants/${participant.participant_id}`}>
                            <Button variant="ghost" size="sm">View</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

