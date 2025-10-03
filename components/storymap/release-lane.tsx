'use client';

import { Release, StepWithStories } from '@/lib/types/storymap.types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StepColumn } from './step-column';
import { AddStepDialog } from './add-step-dialog';
import { deleteRelease } from '@/lib/actions/release.actions';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';

interface ReleaseLaneProps {
  release: Release | null; // null for backlog
  steps: StepWithStories[];
  allReleases: Release[];
  onRefresh: () => void;
  journeyId: string;
}

export function ReleaseLane({ release, steps, allReleases, onRefresh, journeyId }: ReleaseLaneProps) {
  const handleDelete = async () => {
    if (!release) return;
    const result = await deleteRelease(release.$id);
    if (result.success) {
      onRefresh();
    }
  };

  // Count total stories in this release
  const storyCount = steps.reduce((sum, step) => sum + step.stories.length, 0);

  const isBacklog = !release;

  return (
    <Card className={`mb-6 overflow-hidden ${isBacklog ? 'border-dashed border-2' : ''}`}>
      {/* Release Header */}
      <div className={`px-6 py-3 border-b ${isBacklog ? 'bg-muted/30' : 'bg-primary/5'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <h3 className="text-lg font-semibold">
              {isBacklog ? '📦 Backlog' : release.name}
            </h3>
            {release?.description && (
              <p className="text-sm text-muted-foreground">{release.description}</p>
            )}
            <Badge variant="secondary" className="ml-auto">
              {storyCount} {storyCount === 1 ? 'story' : 'stories'}
            </Badge>
          </div>

          {!isBacklog && (
            <div className="flex items-center gap-2 ml-4">
              <DeleteConfirmationDialog
                title="Delete Release"
                description="This will delete the release. Stories in this release will be moved to the Backlog."
                itemName={release.name}
                itemType="Release"
                onConfirm={handleDelete}
                triggerClassName="h-8 w-8 p-0"
              />
            </div>
          )}
        </div>
      </div>

      {/* Steps in this Release */}
      <div className="p-6">
        <div className="overflow-x-auto pb-4">
          <div className="flex items-start gap-0 min-w-min">
            {steps.map((step, index) => (
              <div key={step.$id} className="flex items-start">
                <StepColumn
                  step={step}
                  releases={allReleases}
                  releaseId={release?.$id || null}
                  onRefresh={onRefresh}
                />
                {index < steps.length - 1 && (
                  <div className="flex flex-col items-center justify-center px-3 pt-16">
                    <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold mb-2">
                      THEN
                    </div>
                    <div className="text-muted-foreground text-2xl">→</div>
                  </div>
                )}
              </div>
            ))}
            <AddStepDialog
              journeyId={journeyId}
              order={steps.length}
              onSuccess={onRefresh}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
