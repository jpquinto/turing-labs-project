'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface SessionHeaderProps {
  trialName: string;
  trialId: string;
  completedOutcomes: number;
  totalOutcomes: number;
  currentRecipeIndex: number;
  totalRecipes: number;
}

export default function SessionHeader({
  trialName,
  trialId,
  completedOutcomes,
  totalOutcomes,
  currentRecipeIndex,
  totalRecipes,
}: SessionHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
              Testing Session
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
              {trialName}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Progress Indicator */}
            <div className="flex items-center gap-3">
              <div className="text-sm">
                <div className="font-medium text-zinc-900 dark:text-white">
                  {completedOutcomes} of {totalOutcomes} complete
                </div>
                <div className="text-zinc-500 dark:text-zinc-400">
                  Recipe {currentRecipeIndex + 1} of {totalRecipes}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push(`/trials/${trialId}`)}
            >
              Exit Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

