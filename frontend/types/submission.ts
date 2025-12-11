export interface Submission {
  submission_id: string;
  recipe_id: string;
  trial_id: string;
  participant_id: string;
  score: number;
  status: 'draft' | 'saved';
  notes?: string;
  voice_memo_key?: string;
  last_updated: string;
}

