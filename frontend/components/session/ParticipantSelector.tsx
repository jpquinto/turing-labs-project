'use client';

import type { Participant } from '@/types';

interface ParticipantSelectorProps {
  participants: Participant[];
  selectedParticipant: Participant | null;
  onSelectParticipant: (participant: Participant) => void;
}

export default function ParticipantSelector({
  participants,
  selectedParticipant,
  onSelectParticipant,
}: ParticipantSelectorProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
        Select Participant
      </label>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {participants.map((participant) => (
          <button
            key={participant.participant_id}
            onClick={() => onSelectParticipant(participant)}
            className={`px-5 py-3 rounded-lg font-medium transition-all whitespace-nowrap flex flex-col items-start gap-1 ${
              selectedParticipant?.participant_id ===
              participant.participant_id
                ? "bg-blue-600 text-white border-2 border-blue-600 shadow-sm"
                : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-2 border-zinc-200 dark:border-zinc-800 hover:border-blue-300"
            }`}
          >
            <span className="font-semibold">{participant.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

