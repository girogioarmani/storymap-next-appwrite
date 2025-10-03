'use client';

import { StepWithStories, Release } from '@/lib/types/storymap.types';
import { Card } from '@/components/ui/card';
import { StoryCard } from './story-card';
import { AddStoryDialog } from './add-story-dialog';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { deleteStep } from '@/lib/actions/storymap.actions';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';

interface StepColumnProps {
  step: StepWithStories;
  releases?: Release[];
  releaseId?: string | null; // Current release context
  onRefresh: () => void;
}

export function StepColumn({ step, releases, releaseId, onRefresh }: StepColumnProps) {
  // Create a unique droppable ID for this step in this release context
  const dropId = `step-${step.$id}-${releaseId || 'backlog'}`;
  const { setNodeRef, isOver } = useDroppable({
    id: dropId,
  });

  const handleDelete = async () => {
    const result = await deleteStep(step.$id);
    if (result.success) {
      onRefresh();
    }
  };

  const storyIds = step.stories.map((s) => s.$id);

  return (
    <Card 
      ref={setNodeRef}
      className={`w-[280px] shrink-0 p-4 transition-colors ${
        isOver ? 'bg-primary/10 border-primary' : 'bg-accent/20'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">{step.name}</h3>
          {step.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {step.description}
            </p>
          )}
        </div>
        <DeleteConfirmationDialog
          title="Delete Step"
          description="This will permanently delete this step and all stories within it."
          itemName={step.name}
          itemType="Step"
          onConfirm={handleDelete}
          triggerClassName="h-7 w-7 p-0 shrink-0"
        />
      </div>

      <div className="space-y-0 min-h-[200px]">
        <SortableContext items={storyIds} strategy={verticalListSortingStrategy}>
          {step.stories.map((story, index) => (
            <div key={story.$id}>
              <StoryCard story={story} allStories={step.stories} onRefresh={onRefresh} />
              {index < step.stories.length - 1 && (
                <div className="flex items-center justify-center py-1">
                  <div className="bg-amber-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                    OR
                  </div>
                </div>
              )}
            </div>
          ))}
        </SortableContext>

        <div className="mt-2">
          <AddStoryDialog
            stepId={step.$id}
            order={step.stories.length}
            releases={releases}
            onSuccess={onRefresh}
          />
        </div>
      </div>
    </Card>
  );
}
