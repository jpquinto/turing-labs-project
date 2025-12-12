'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trial, Recipe, Participant } from '@/types';
import { getTrial } from '@/actions/trials';
import { getRecipesByTrial } from '@/actions/recipes';
import { getParticipantsByTrial } from '@/actions/participants';
import { transcribeVoiceMemo } from '@/actions/transcription';
import { createSubmission, updateSubmission, getSubmissionsByTrial } from '@/actions/submissions';
import type { Submission } from '@/types';
import SessionHeader from '@/components/session/SessionHeader';
import ParticipantSelector from '@/components/session/ParticipantSelector';
import RecipeTabs from '@/components/session/RecipeTabs';
import RecipeDetailsCard from '@/components/session/RecipeDetailsCard';
import MeasurementCard from '@/components/session/MeasurementCard';

export default function TestingSessionPage() {
  const params = useParams();
  const router = useRouter();
  const trialId = params.trial_id as string;

  const [trial, setTrial] = useState<Trial | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [voiceMemos, setVoiceMemos] = useState<{ [key: string]: string }>({});
  const [audioUrls, setAudioUrls] = useState<{ [key: string]: string }>({});
  const [audioDurations, setAudioDurations] = useState<{ [key: string]: number }>({});
  const [audioPlaying, setAudioPlaying] = useState<{ [key: string]: boolean }>({});
  const [noteType, setNoteType] = useState<{ [key: string]: 'text' | 'voice' }>({});
  const [transcribing, setTranscribing] = useState<{ [key: string]: boolean }>({});
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSessionData();
  }, [trialId]);

  const loadSessionData = async () => {
    try {
      const [trialResponse, recipesResponse, participantsResponse, submissionsResponse] = await Promise.all([
        getTrial({ trial_id: trialId }),
        getRecipesByTrial({ trial_id: trialId }),
        getParticipantsByTrial({ trial_id: trialId }),
        getSubmissionsByTrial({ trial_id: trialId })
      ]);

      // Handle both array and object responses from backend
      const trialData = Array.isArray(trialResponse.data)
        ? trialResponse.data[0]
        : trialResponse.data;

      setTrial(trialData);
      setRecipes(recipesResponse.data);
      setParticipants(participantsResponse.data);
      setSubmissions(submissionsResponse.data);

      // Set first participant as default if available
      if (participantsResponse.data.length > 0) {
        setSelectedParticipant(participantsResponse.data[0]);
      }

      // Populate existing submissions into state
      populateExistingSubmissions(submissionsResponse.data, recipesResponse.data, participantsResponse.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load session data');
    } finally {
      setLoading(false);
    }
  };

  // Populate state from existing submissions
  const populateExistingSubmissions = (
    submissions: Submission[],
    recipes: Recipe[],
    participants: Participant[]
  ) => {
    const newScores: { [key: string]: number } = {};
    const newNotes: { [key: string]: string } = {};
    const newVoiceMemos: { [key: string]: string } = {};

    submissions.forEach(submission => {
      // Find recipe index and participant
      const recipeIndex = recipes.findIndex(r => r.recipe_id === submission.recipe_id);
      const participant = participants.find(p => p.participant_id === submission.participant_id);

      if (recipeIndex === -1 || !participant) return;

      // Extract outcome from submission_id format: participantId::recipeId::outcome
      const parts = submission.submission_id.split('::');
      if (parts.length !== 3) return;

      // The outcome is the third part
      const outcome = parts[2];

      const key = `${participant.participant_id}-${recipeIndex}-${outcome}`;

      newScores[key] = submission.score;
      if (submission.notes) newNotes[key] = submission.notes;
      if (submission.voice_memo_key) newVoiceMemos[key] = submission.voice_memo_key;
    });

    setScores(newScores);
    setNotes(newNotes);
    setVoiceMemos(newVoiceMemos);
  };

  const currentRecipe = recipes[currentRecipeIndex];
  const outcomeTypes = ['Overall Taste', 'Sweetness Level', 'Texture Quality', 'Aftertaste'];

  const handleScoreChange = (outcome: string, value: number[]) => {
    const key = `${selectedParticipant?.participant_id}-${currentRecipeIndex}-${outcome}`;
    setScores({ ...scores, [key]: value[0] });
  };

  const handleNotesChange = (outcome: string, value: string) => {
    const key = `${selectedParticipant?.participant_id}-${currentRecipeIndex}-${outcome}`;
    setNotes({ ...notes, [key]: value });
  };

  const handleNoteTypeChange = (outcome: string, type: 'text' | 'voice') => {
    const key = `${selectedParticipant?.participant_id}-${currentRecipeIndex}-${outcome}`;
    setNoteType({ ...noteType, [key]: type });
  };

  const handleVoiceMemoUpload = async (outcome: string, s3Key: string, audioUrl: string, duration: number) => {
    if (!selectedParticipant || !currentRecipe) return;

    const key = `${selectedParticipant.participant_id}-${currentRecipeIndex}-${outcome}`;
    setVoiceMemos(prev => ({ ...prev, [key]: s3Key }));
    setAudioUrls(prev => ({ ...prev, [key]: audioUrl }));
    setAudioDurations(prev => ({ ...prev, [key]: duration }));

    // Start transcription
    setTranscribing(prev => ({ ...prev, [key]: true }));

    try {
      // Use deterministic submission_id
      const submissionId = getSubmissionId(
        selectedParticipant.participant_id,
        currentRecipe.recipe_id,
        outcome
      );

      const data = await transcribeVoiceMemo({
        submission_id: submissionId,
        voice_memo_key: s3Key,
        recipe_id: currentRecipe.recipe_id,
      });

      // Store transcription as notes
      setNotes(prev => ({ ...prev, [key]: data.transcription }));
    } catch (err) {
      console.error('Error transcribing voice memo:', err);
      // Optionally show error to user
      setError('Failed to transcribe voice memo. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setTranscribing(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleClearVoiceMemo = (outcome: string) => {
    if (!selectedParticipant) return;

    const key = `${selectedParticipant.participant_id}-${currentRecipeIndex}-${outcome}`;

    setVoiceMemos(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    setAudioUrls(prev => {
      const updated = { ...prev };
      if (updated[key]) {
        URL.revokeObjectURL(updated[key]);
      }
      delete updated[key];
      return updated;
    });
    setAudioDurations(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    setAudioPlaying(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    setNotes(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    setTranscribing(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
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

  // Check if a recipe is completed for the current participant
  const isRecipeCompleted = (recipeIndex: number) => {
    if (!selectedParticipant) return false;
    const recipe = recipes[recipeIndex];
    if (!recipe) return false;

    // Check if all outcomes have scores saved
    return outcomeTypes.every(outcome => {
      const key = `${selectedParticipant.participant_id}-${recipeIndex}-${outcome}`;
      // Check if there's a saved submission for this outcome
      return submissions.some(sub =>
        sub.participant_id === selectedParticipant.participant_id &&
        sub.recipe_id === recipe.recipe_id &&
        sub.status === 'saved'
      );
    });
  };

  // Generate deterministic submission_id for an outcome
  // Using :: as delimiter to avoid conflicts with UUID dashes
  const getSubmissionId = (participantId: string, recipeId: string, outcome: string) => {
    return `${participantId}::${recipeId}::${outcome}`;
  };

  // Save individual outcome
  const handleSaveOutcome = async (outcome: string) => {
    if (!selectedParticipant || !currentRecipe) return;

    const key = `${selectedParticipant.participant_id}-${currentRecipeIndex}-${outcome}`;
    const score = scores[key];
    const note = notes[key];
    const voiceMemo = voiceMemos[key];

    if (score === undefined) {
      setError('Please set a score before saving');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setSaving(prev => ({ ...prev, [key]: true }));

    try {
      const submissionId = getSubmissionId(
        selectedParticipant.participant_id,
        currentRecipe.recipe_id,
        outcome
      );

      // Check if submission already exists
      const existingSubmission = submissions.find(
        s => s.submission_id === submissionId && s.recipe_id === currentRecipe.recipe_id
      );

      if (existingSubmission) {
        // Update existing submission
        await updateSubmission({
          submission_id: submissionId,
          recipe_id: currentRecipe.recipe_id,
          updates: {
            score: score,
            status: 'saved',
            notes: note || undefined,
            voice_memo_key: voiceMemo || undefined,
          },
        });
      } else {
        // Create new submission with deterministic ID
        await createSubmission({
          recipe_id: currentRecipe.recipe_id,
          trial_id: trialId,
          participant_id: selectedParticipant.participant_id,
          score: score,
          status: 'saved',
          notes: note || undefined,
          voice_memo_key: voiceMemo || undefined,
          submission_id: submissionId,
        });
      }

      // Reload submissions
      const submissionsResponse = await getSubmissionsByTrial({ trial_id: trialId });
      setSubmissions(submissionsResponse.data);
    } catch (err) {
      console.error('Error saving outcome:', err);
      setError('Failed to save. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  };

  // Save all outcomes as draft
  const handleSaveAsDraft = async () => {
    if (!selectedParticipant || !currentRecipe) return;

    setSaving(prev => ({ ...prev, draft: true }));

    try {
      // Save all outcomes that have scores
      const savePromises = outcomeTypes
        .filter(outcome => {
          const key = `${selectedParticipant.participant_id}-${currentRecipeIndex}-${outcome}`;
          return scores[key] !== undefined;
        })
        .map(async outcome => {
          const key = `${selectedParticipant.participant_id}-${currentRecipeIndex}-${outcome}`;
          const submissionId = getSubmissionId(
            selectedParticipant.participant_id,
            currentRecipe.recipe_id,
            outcome
          );

          // Check if submission already exists
          const existingSubmission = submissions.find(
            s => s.submission_id === submissionId && s.recipe_id === currentRecipe.recipe_id
          );

          if (existingSubmission) {
            return updateSubmission({
              submission_id: submissionId,
              recipe_id: currentRecipe.recipe_id,
              updates: {
                score: scores[key],
                status: 'draft',
                notes: notes[key] || undefined,
                voice_memo_key: voiceMemos[key] || undefined,
              },
            });
          } else {
            return createSubmission({
              recipe_id: currentRecipe.recipe_id,
              trial_id: trialId,
              participant_id: selectedParticipant.participant_id,
              score: scores[key],
              status: 'draft',
              notes: notes[key] || undefined,
              voice_memo_key: voiceMemos[key] || undefined,
              submission_id: submissionId,
            });
          }
        });

      await Promise.all(savePromises);

      // Reload submissions
      const submissionsResponse = await getSubmissionsByTrial({ trial_id: trialId });
      setSubmissions(submissionsResponse.data);

      setError('Saved as draft!');
      setTimeout(() => setError(null), 2000);
    } catch (err) {
      console.error('Error saving draft:', err);
      setError('Failed to save draft. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(prev => ({ ...prev, draft: false }));
    }
  };

  // Save all and continue to next recipe
  const handleSaveAndContinue = async () => {
    if (!selectedParticipant || !currentRecipe) return;

    // Check if all outcomes have scores
    const allComplete = outcomeTypes.every(outcome => {
      const key = `${selectedParticipant.participant_id}-${currentRecipeIndex}-${outcome}`;
      return scores[key] !== undefined;
    });

    if (!allComplete) {
      setError('Please complete all measurements before continuing');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setSaving(prev => ({ ...prev, continue: true }));

    try {
      // Save all outcomes as 'saved'
      const savePromises = outcomeTypes.map(async outcome => {
        const key = `${selectedParticipant.participant_id}-${currentRecipeIndex}-${outcome}`;
        const submissionId = getSubmissionId(
          selectedParticipant.participant_id,
          currentRecipe.recipe_id,
          outcome
        );

        // Check if submission already exists
        const existingSubmission = submissions.find(
          s => s.submission_id === submissionId && s.recipe_id === currentRecipe.recipe_id
        );

        if (existingSubmission) {
          return updateSubmission({
            submission_id: submissionId,
            recipe_id: currentRecipe.recipe_id,
            updates: {
              score: scores[key],
              status: 'saved',
              notes: notes[key] || undefined,
              voice_memo_key: voiceMemos[key] || undefined,
            },
          });
        } else {
          return createSubmission({
            recipe_id: currentRecipe.recipe_id,
            trial_id: trialId,
            participant_id: selectedParticipant.participant_id,
            score: scores[key],
            status: 'saved',
            notes: notes[key] || undefined,
            voice_memo_key: voiceMemos[key] || undefined,
            submission_id: submissionId,
          });
        }
      });

      await Promise.all(savePromises);

      // Reload submissions
      const submissionsResponse = await getSubmissionsByTrial({ trial_id: trialId });
      setSubmissions(submissionsResponse.data);

      // Move to next recipe if available
      if (currentRecipeIndex < recipes.length - 1) {
        setCurrentRecipeIndex(currentRecipeIndex + 1);
      } else {
        router.push(`/trials/${trialId}`);
      }
    } catch (err) {
      console.error('Error saving and continuing:', err);
      setError('Failed to save. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(prev => ({ ...prev, continue: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading session...</p>
      </div>
    );
  }

  if (error || !trial || !currentRecipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Failed to load session'}</p>
          <Button onClick={() => router.push(`/trials/${trialId}`)}>
            Back to Trial
          </Button>
        </div>
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            No participants found for this trial. Please add participants before starting a testing session.
          </p>
          <Button onClick={() => router.push(`/trials/${trialId}`)}>
            Back to Trial
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedParticipant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Please select a participant...</p>
      </div>
    );
  }

  const completedOutcomes = outcomeTypes.filter(outcome => {
    const key = `${selectedParticipant.participant_id}-${currentRecipeIndex}-${outcome}`;
    return scores[key] !== undefined;
  }).length;

  const progress = Math.round((completedOutcomes / outcomeTypes.length) * 100);

  // Check if there are any changes for the current participant and recipe
  const hasChanges = outcomeTypes.some(outcome => {
    const key = `${selectedParticipant.participant_id}-${currentRecipeIndex}-${outcome}`;
    return scores[key] !== undefined || notes[key] || voiceMemos[key];
  });

  const allFieldsComplete = completedOutcomes === outcomeTypes.length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header Bar */}
      <SessionHeader
        trialName={trial.trial_name}
        trialId={trialId}
        completedOutcomes={completedOutcomes}
        totalOutcomes={outcomeTypes.length}
        currentRecipeIndex={currentRecipeIndex}
        totalRecipes={recipes.length}
      />

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Participant Selector */}
        <ParticipantSelector
          participants={participants}
          selectedParticipant={selectedParticipant}
          onSelectParticipant={setSelectedParticipant}
        />

        {/* Recipe Tabs */}
        <RecipeTabs
          recipes={recipes}
          currentRecipeIndex={currentRecipeIndex}
          onRecipeChange={setCurrentRecipeIndex}
          isRecipeCompleted={isRecipeCompleted}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recipe Details Card (Left) */}
          <div className="lg:col-span-1 space-y-4">
            <RecipeDetailsCard
              recipe={currentRecipe}
              currentRecipeIndex={currentRecipeIndex}
              totalRecipes={recipes.length}
              hasChanges={hasChanges}
              allFieldsComplete={allFieldsComplete}
              saving={saving}
              onPreviousRecipe={handlePreviousRecipe}
              onSaveAsDraft={handleSaveAsDraft}
              onSaveAndContinue={handleSaveAndContinue}
            />
          </div>

          {/* Measurement Entry Form (Right) */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  Enter Your Measurements
                </CardTitle>
                <CardDescription>
                  Rate each outcome on a scale of 1-10
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {outcomeTypes.map((outcome, idx) => {
                  const key = `${selectedParticipant.participant_id}-${currentRecipeIndex}-${outcome}`;
                  const score = scores[key] || 5;
                  const note = notes[key] || "";
                  const voiceMemo = voiceMemos[key] || "";
                  const audioUrl = audioUrls[key] || "";
                  const audioDuration = audioDurations[key] || 0;
                  const currentNoteType = noteType[key] || "text";
                  const isTranscribing = transcribing[key] || false;

                  // Check if previous outcome is completed
                  const isPreviousCompleted =
                    idx === 0 ||
                    (() => {
                      const prevOutcome = outcomeTypes[idx - 1];
                      const prevKey = `${selectedParticipant.participant_id}-${currentRecipeIndex}-${prevOutcome}`;
                      return scores[prevKey] !== undefined;
                    })();

                  const isDisabled = !isPreviousCompleted;
                  const isSaving = saving[key] || false;

                  return (
                    <MeasurementCard
                      key={outcome}
                      outcome={outcome}
                      score={score}
                      note={note}
                      voiceMemo={voiceMemo}
                      audioUrl={audioUrl}
                      audioDuration={audioDuration}
                      currentNoteType={currentNoteType}
                      isTranscribing={isTranscribing}
                      isDisabled={isDisabled}
                      isSaving={isSaving}
                      onScoreChange={(value) => handleScoreChange(outcome, value)}
                      onNotesChange={(value) => handleNotesChange(outcome, value)}
                      onNoteTypeChange={(type) => handleNoteTypeChange(outcome, type)}
                      onVoiceMemoUpload={(s3Key, audioUrl, duration) =>
                        handleVoiceMemoUpload(outcome, s3Key, audioUrl, duration)
                      }
                      onSave={() => handleSaveOutcome(outcome)}
                      onClearVoiceMemo={() => handleClearVoiceMemo(outcome)}
                    />
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
