'use client';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { FileText, Mic, Play, Pause, Save } from 'lucide-react';
import VoiceRecorder from '@/components/VoiceRecorder';
import { useState } from 'react';

interface MeasurementCardProps {
  outcome: string;
  score: number;
  note: string;
  voiceMemo: string;
  audioUrl: string;
  audioDuration: number;
  currentNoteType: 'text' | 'voice';
  isTranscribing: boolean;
  isDisabled: boolean;
  isSaving: boolean;
  onScoreChange: (value: number[]) => void;
  onNotesChange: (value: string) => void;
  onNoteTypeChange: (type: 'text' | 'voice') => void;
  onVoiceMemoUpload: (s3Key: string, audioUrl: string, duration: number) => void;
  onSave: () => void;
  onClearVoiceMemo: () => void;
}

export default function MeasurementCard({
  outcome,
  score,
  note,
  voiceMemo,
  audioUrl,
  audioDuration,
  currentNoteType,
  isTranscribing,
  isDisabled,
  isSaving,
  onScoreChange,
  onNotesChange,
  onNoteTypeChange,
  onVoiceMemoUpload,
  onSave,
  onClearVoiceMemo,
}: MeasurementCardProps) {
  const [audioPlaying, setAudioPlaying] = useState(false);

  const isCompleted = score !== 5; // Assuming 5 is default

  return (
    <div
      className={`p-6 rounded-xl border-2 transition-all ${
        isDisabled
          ? "bg-zinc-100 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 opacity-50"
          : isCompleted
          ? "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
          : "bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-800"
      }`}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          {outcome}
          {isDisabled && (
            <span className="ml-2 text-sm font-normal text-zinc-400">
              (Complete previous first)
            </span>
          )}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Rate the {outcome.toLowerCase()}
        </p>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <Slider
            min={1}
            max={10}
            step={0.5}
            value={[score]}
            onValueChange={onScoreChange}
            className="w-full"
            disabled={isDisabled}
          />
          <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mt-3">
            <span>1 - Poor</span>
            <span>5 - Average</span>
            <span>10 - Excellent</span>
          </div>
        </div>
        <div
          className={`text-2xl font-semibold min-w-[60px] text-center ${
            isDisabled
              ? "text-zinc-400 dark:text-zinc-600"
              : "text-blue-600 dark:text-blue-400"
          }`}
        >
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
              variant={
                currentNoteType === "text"
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => onNoteTypeChange("text")}
              disabled={isDisabled}
              className="h-8"
            >
              <FileText className="h-4 w-4 mr-1" />
              Text
            </Button>
            <Button
              type="button"
              variant={
                currentNoteType === "voice"
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => onNoteTypeChange("voice")}
              disabled={isDisabled}
              className="h-8"
            >
              <Mic className="h-4 w-4 mr-1" />
              Voice
            </Button>
          </div>
        </div>

        {currentNoteType === "text" ? (
          <textarea
            rows={2}
            value={note}
            onChange={(e) => onNotesChange(e.target.value)}
            disabled={isDisabled}
            className={`w-full px-3 py-2 border rounded-lg resize-none text-sm ${
              isDisabled
                ? "border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                : "border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
            }`}
            placeholder={
              isDisabled
                ? "Complete previous measurement first"
                : "e.g., Good balance of flavors. Slightly less sweet than control..."
            }
          />
        ) : (
          <div
            className={`w-full p-4 border rounded-lg ${
              isDisabled
                ? "border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50 cursor-not-allowed"
                : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
            }`}
          >
            {isDisabled ? (
              <p className="text-center text-sm text-zinc-400 dark:text-zinc-600">
                Complete previous measurement first
              </p>
            ) : isTranscribing ? (
              <div className="text-center space-y-3 py-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Transcribing voice memo...
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  This may take a moment
                </p>
              </div>
            ) : voiceMemo ? (
              <div className="space-y-3">
                {/* Audio Player */}
                {audioUrl && (
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mic className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Voice memo
                        </span>
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          ({Math.floor(audioDuration / 60)}:
                          {(audioDuration % 60)
                            .toString()
                            .padStart(2, "0")}
                          )
                        </span>
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          const audio = document.getElementById(
                            `audio-${outcome}`
                          ) as HTMLAudioElement;
                          if (audio) {
                            if (audioPlaying) {
                              audio.pause();
                              setAudioPlaying(false);
                            } else {
                              audio.play();
                              setAudioPlaying(true);
                            }
                          }
                        }}
                        variant="ghost"
                        size="sm"
                      >
                        {audioPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <audio
                      id={`audio-${outcome}`}
                      src={audioUrl}
                      onEnded={() => setAudioPlaying(false)}
                      className="hidden"
                    />
                  </div>
                )}

                {/* Transcription */}
                {note && (
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                      Transcription:
                    </p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      {note}
                    </p>
                  </div>
                )}

                <div className="flex justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onClearVoiceMemo}
                    className="text-xs"
                  >
                    Record New
                  </Button>
                </div>
              </div>
            ) : (
              <VoiceRecorder
                onUploadComplete={onVoiceMemoUpload}
                disabled={isDisabled}
              />
            )}
          </div>
        )}
      </div>

      {/* Save Button at Bottom */}
      <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <Button
          className="w-full"
          onClick={onSave}
          disabled={isDisabled || isSaving || score === undefined}
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

