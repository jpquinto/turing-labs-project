'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause, Trash2, Upload } from 'lucide-react';
import { getVoiceMemoUploadUrl } from '@/actions/voice_memo';

interface VoiceRecorderProps {
  onUploadComplete: (s3Key: string, audioUrl: string, duration: number) => void;
  disabled?: boolean;
}

export default function VoiceRecorder({ onUploadComplete, disabled = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Stop timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setRecordingTime(0);
  };

  const uploadRecording = async () => {
    if (!audioBlob) return;

    try {
      setIsUploading(true);
      setError(null);

      // Get presigned URL
      const timestamp = Date.now();
      const response = await getVoiceMemoUploadUrl({
        file_name: `voice-memo-${timestamp}.webm`,
        content_type: 'audio/webm',
      });

      // Upload to S3 using presigned URL
      console.log('Uploading to URL:', response.data.upload_url);
      console.log('S3 Key:', response.data.s3_key);
      
      const uploadResponse = await axios.put(response.data.upload_url, audioBlob, {
        headers: {
          'Content-Type': 'audio/webm',
        },
        withCredentials: false,
      });

      // Call callback with S3 key, audio URL, and duration
      onUploadComplete(response.data.s3_key, audioUrl || '', recordingTime);

    } catch (err) {
      console.error('Error uploading voice memo:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload voice memo');
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {!audioBlob ? (
        <div className="text-center space-y-4">
          <Mic className="h-12 w-12 mx-auto text-zinc-400" />
          
          {isRecording ? (
            <>
              <div className="text-lg font-semibold text-red-600 dark:text-red-400 animate-pulse">
                Recording... {formatTime(recordingTime)}
              </div>
              <Button
                type="button"
                onClick={stopRecording}
                variant="destructive"
                size="lg"
                className="w-full"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Click to start recording
              </p>
              <Button
                type="button"
                onClick={startRecording}
                disabled={disabled}
                size="lg"
                className="w-full"
              >
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              <span className="text-sm font-medium">Recording ready</span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                ({formatTime(recordingTime)})
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={playAudio}
                variant="ghost"
                size="sm"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                onClick={deleteRecording}
                variant="ghost"
                size="sm"
                disabled={isUploading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            type="button"
            onClick={uploadRecording}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Voice Memo
              </>
            )}
          </Button>

          <audio
            ref={audioRef}
            src={audioUrl || undefined}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}

