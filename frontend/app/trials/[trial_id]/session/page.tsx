'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { FileText, Mic } from 'lucide-react';
import { Trial, Recipe, Participant } from '@/types';
import { getTrial } from '@/actions/trials';
import { getRecipesByTrial } from '@/actions/recipes';
import { getParticipantsByTrial } from '@/actions/participants';
import VoiceRecorder from '@/components/VoiceRecorder';

export default function TestingSessionPage() {
  const params = useParams();
  const router = useRouter();
  const trialId = params.trial_id as string;

  const [trial, setTrial] = useState<Trial | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [voiceMemos, setVoiceMemos] = useState<{ [key: string]: string }>({});
  const [noteType, setNoteType] = useState<{ [key: string]: 'text' | 'voice' }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSessionData();
  }, [trialId]);

  const loadSessionData = async () => {
    try {
      const [trialResponse, recipesResponse, participantsResponse] = await Promise.all([
        getTrial({ trial_id: trialId }),
        getRecipesByTrial({ trial_id: trialId }),
        getParticipantsByTrial({ trial_id: trialId })
      ]);

      // Handle both array and object responses from backend
      const trialData = Array.isArray(trialResponse.data)
        ? trialResponse.data[0]
        : trialResponse.data;

      setTrial(trialData);
      setRecipes(recipesResponse.data);
      setParticipants(participantsResponse.data);

      // Set first participant as default if available
      if (participantsResponse.data.length > 0) {
        setSelectedParticipant(participantsResponse.data[0]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load session data');
    } finally {
      setLoading(false);
    }
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

  const handleVoiceMemoUpload = (outcome: string, s3Key: string) => {
    const key = `${selectedParticipant?.participant_id}-${currentRecipeIndex}-${outcome}`;
    setVoiceMemos({ ...voiceMemos, [key]: s3Key });
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
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Testing Session</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
                {trial.trial_name}
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
        {/* Participant Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
            Select Participant
          </label>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {participants.map((participant) => (
              <button
                key={participant.participant_id}
                onClick={() => setSelectedParticipant(participant)}
                className={`px-5 py-3 rounded-lg font-medium transition-all whitespace-nowrap flex flex-col items-start gap-1 ${
                  selectedParticipant?.participant_id === participant.participant_id
                    ? 'bg-blue-600 text-white border-2 border-blue-600 shadow-sm'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-2 border-zinc-200 dark:border-zinc-800 hover:border-blue-300'
                }`}
              >
                <span className="font-semibold">{participant.name}</span>
              </button>
            ))}
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
          <div className="lg:col-span-1 space-y-4">
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
                      <Badge
                        className={
                          currentRecipe.target_sugar_reduction_percent < 30
                            ? 'bg-yellow-500 hover:bg-yellow-600'
                            : 'bg-green-500 hover:bg-green-600'
                        }
                      >
                        {currentRecipe.target_sugar_reduction_percent}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-700 dark:text-zinc-300">Cost per Unit</span>
                      <Badge className="bg-blue-500 hover:bg-blue-600">
                        ${currentRecipe.target_cost_per_unit.toFixed(2)}
                      </Badge>
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
                  const key = `${selectedParticipant.participant_id}-${currentRecipeIndex}-${outcome}`;
                  const score = scores[key] || 5;
                  const note = notes[key] || '';
                  const voiceMemo = voiceMemos[key] || '';
                  const currentNoteType = noteType[key] || 'text';
                  const isCompleted = scores[key] !== undefined;

                  // Check if previous outcome is completed
                  const isPreviousCompleted = idx === 0 || (() => {
                    const prevOutcome = outcomeTypes[idx - 1];
                    const prevKey = `${selectedParticipant.participant_id}-${currentRecipeIndex}-${prevOutcome}`;
                    return scores[prevKey] !== undefined;
                  })();

                  const isDisabled = !isPreviousCompleted;

                  return (
                    <div 
                      key={outcome}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        isDisabled
                          ? 'bg-zinc-100 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 opacity-50'
                          : isCompleted
                            ? 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800'
                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-800'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                            {outcome}
                            {isDisabled && <span className="ml-2 text-sm font-normal text-zinc-400">(Complete previous first)</span>}
                          </h3>
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
                          <Slider
                            min={1}
                            max={10}
                            step={0.5}
                            value={[score]}
                            onValueChange={(value) => handleScoreChange(outcome, value)}
                            className="w-full"
                            disabled={isDisabled}
                          />
                          <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mt-3">
                            <span>1 - Poor</span>
                            <span>5 - Average</span>
                            <span>10 - Excellent</span>
                          </div>
                        </div>
                        <div className={`text-2xl font-semibold min-w-[60px] text-center ${
                          isDisabled ? 'text-zinc-400 dark:text-zinc-600' : 'text-blue-600 dark:text-blue-400'
                        }`}>
                          {score}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Add Notes (Optional)
                          </label>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant={currentNoteType === 'text' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleNoteTypeChange(outcome, 'text')}
                              disabled={isDisabled}
                              className="h-8"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Text
                            </Button>
                            <Button
                              type="button"
                              variant={currentNoteType === 'voice' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleNoteTypeChange(outcome, 'voice')}
                              disabled={isDisabled}
                              className="h-8"
                            >
                              <Mic className="h-4 w-4 mr-1" />
                              Voice
                            </Button>
                          </div>
                        </div>

                        {currentNoteType === 'text' ? (
                          <textarea
                            rows={2}
                            value={note}
                            onChange={(e) => handleNotesChange(outcome, e.target.value)}
                            disabled={isDisabled}
                            className={`w-full px-3 py-2 border rounded-lg resize-none text-sm ${
                              isDisabled
                                ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                                : 'border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white'
                            }`}
                            placeholder={isDisabled ? "Complete previous measurement first" : "e.g., Good balance of flavors. Slightly less sweet than control..."}
                          />
                        ) : (
                          <div className={`w-full p-4 border rounded-lg ${
                            isDisabled
                              ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50 cursor-not-allowed'
                              : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950'
                          }`}>
                            {isDisabled ? (
                              <p className="text-center text-sm text-zinc-400 dark:text-zinc-600">
                                Complete previous measurement first
                              </p>
                            ) : voiceMemo ? (
                              <div className="text-center space-y-2">
                                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                                  <Mic className="h-5 w-5" />
                                  <span className="text-sm font-medium">Voice memo uploaded</span>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const updatedMemos = { ...voiceMemos };
                                    delete updatedMemos[key];
                                    setVoiceMemos(updatedMemos);
                                  }}
                                  className="text-xs"
                                >
                                  Record New
                                </Button>
                              </div>
                            ) : (
                              <VoiceRecorder
                                onUploadComplete={(s3Key) => handleVoiceMemoUpload(outcome, s3Key)}
                                disabled={isDisabled}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
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

