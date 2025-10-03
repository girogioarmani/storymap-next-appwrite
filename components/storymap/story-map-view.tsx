'use client';

import { useState, useCallback, useEffect } from 'react';
import { CompleteStoryMap, Release, StepWithStories } from '@/lib/types/storymap.types';
import { Epic } from '@/lib/types/storymap.types';
import { EpicSelector } from './epic-selector';
import { AddEpicDialog } from './add-epic-dialog';
import { JourneySelector } from './journey-selector';
import { AddReleaseDialog } from './add-release-dialog';
import { ReleaseLane } from './release-lane';
import { getAllEpics, getCompleteStoryMap } from '@/lib/actions/storymap.actions';
import { getReleasesByJourney } from '@/lib/actions/release.actions';
import { updateStoryOrder, updateStoryPlacement } from '@/lib/actions/storymap.actions';
import { 
  DragEndEvent, 
  DragStartEvent, 
  DragOverlay,
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';

export function StoryMapView() {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null);
  const [storyMap, setStoryMap] = useState<CompleteStoryMap | null>(null);
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before starting drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadEpics = useCallback(async () => {
    const result = await getAllEpics();
    if (result.success && result.data) {
      setEpics(result.data as Epic[]);
      
      // Auto-select first epic if none selected
      if (!selectedEpicId && result.data.length > 0) {
        setSelectedEpicId(result.data[0].$id);
      }
    }
    setLoading(false);
  }, [selectedEpicId]);

  const loadStoryMap = useCallback(async () => {
    if (!selectedEpicId) {
      setStoryMap(null);
      return;
    }

    setLoading(true);
    const result = await getCompleteStoryMap(selectedEpicId);
    if (result.success && result.data) {
      setStoryMap(result.data as CompleteStoryMap);
      
      // Auto-select first journey if none selected
      if (result.data.journeys.length > 0 && !selectedJourneyId) {
        setSelectedJourneyId(result.data.journeys[0].$id);
      }
    }
    setLoading(false);
  }, [selectedEpicId, selectedJourneyId]);

  const loadReleases = useCallback(async () => {
    if (!selectedJourneyId) {
      setReleases([]);
      return;
    }

    const result = await getReleasesByJourney(selectedJourneyId);
    if (result.success && result.data) {
      setReleases(result.data as Release[]);
    }
  }, [selectedJourneyId]);

  useEffect(() => {
    loadEpics();
  }, []);

  useEffect(() => {
    loadStoryMap();
  }, [selectedEpicId]);

  useEffect(() => {
    loadReleases();
  }, [selectedJourneyId]);

  const handleRefresh = useCallback(() => {
    loadEpics();
    loadStoryMap();
    loadReleases();
  }, [loadEpics, loadStoryMap, loadReleases]);

  const handleEpicChange = (epicId: string) => {
    setSelectedEpicId(epicId);
    setSelectedJourneyId(null);
    setStoryMap(null);
    setReleases([]);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveStoryId(event.active.id.toString());
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveStoryId(null);
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // Parse the drop target ID - could be a story ID, step ID, or release lane ID
    const overId = over.id.toString();
    const activeId = active.id.toString();

    // Find the active story being dragged
    const activeStory = storyMap?.journeys
      .flatMap((j) => j.steps)
      .flatMap((s) => s.stories)
      .find((story) => story.$id === activeId);

    if (!activeStory) return;

    // Check if dropping on a step column (format: step-{stepId}-{releaseId|backlog})
    if (overId.startsWith('step-')) {
      const parts = overId.split('-');
      const targetStepId = parts[1];
      const targetReleaseId = parts[2] === 'backlog' ? null : parts[2];

      // Find the target step
      const targetStep = storyMap?.journeys
        .flatMap((j) => j.steps)
        .find((s) => s.$id === targetStepId);

      if (!targetStep) return;

      // Moving to a different step or release
      if (activeStory.stepId !== targetStepId || activeStory.releaseId !== targetReleaseId) {
        const targetStories = targetStep.stories.filter(s => 
          s.releaseId === targetReleaseId
        );
        
        await updateStoryPlacement(activeStory.$id, {
          stepId: targetStepId,
          releaseId: targetReleaseId,
          order: targetStories.length, // Add to end of target
        });

        handleRefresh();
        return;
      }
    }

    // Otherwise, dropping on another story - reorder within same step
    const overStory = storyMap?.journeys
      .flatMap((j) => j.steps)
      .flatMap((s) => s.stories)
      .find((story) => story.$id === overId);

    if (!overStory) return;

    // Moving to a different step or release via story
    if (activeStory.stepId !== overStory.stepId || activeStory.releaseId !== overStory.releaseId) {
      // Find position of over story
      const targetStep = storyMap?.journeys
        .flatMap((j) => j.steps)
        .find((s) => s.$id === overStory.stepId);

      if (!targetStep) return;

      const targetStories = targetStep.stories.filter(s => 
        s.releaseId === overStory.releaseId
      );
      const targetIndex = targetStories.findIndex(s => s.$id === overId);

      await updateStoryPlacement(activeStory.$id, {
        stepId: overStory.stepId,
        releaseId: overStory.releaseId,
        order: targetIndex,
      });

      // Reorder remaining stories
      const remainingStories = targetStories.filter(s => s.$id !== activeStory.$id);
      await Promise.all(
        remainingStories.map((story, index) => {
          const newIndex = index >= targetIndex ? index + 1 : index;
          return updateStoryOrder(story.$id, newIndex);
        })
      );

      handleRefresh();
      return;
    }

    // Reordering within the same step and release
    const step = storyMap?.journeys
      .flatMap((j) => j.steps)
      .find((s) => s.$id === activeStory.stepId);

    if (!step) return;

    const storiesInSameRelease = step.stories.filter(s => 
      s.releaseId === activeStory.releaseId
    );

    const oldIndex = storiesInSameRelease.findIndex((s) => s.$id === activeId);
    const newIndex = storiesInSameRelease.findIndex((s) => s.$id === overId);

    if (oldIndex === -1 || newIndex === -1) return;

    const newStories = arrayMove(storiesInSameRelease, oldIndex, newIndex);

    // Priority hierarchy: must > should > could > wont
    const priorityRank = { must: 0, should: 1, could: 2, wont: 3 };

    // Smart priority adjustment: if moving above a higher priority, adopt that priority
    await Promise.all(
      newStories.map((story, index) => {
        let newPriority = story.priority;
        
        // Check if there's a higher priority story below this one
        const storiesBelow = newStories.slice(index + 1);
        const highestPriorityBelow = storiesBelow.reduce((highest, s) => {
          return priorityRank[s.priority as keyof typeof priorityRank] < priorityRank[highest as keyof typeof priorityRank] ? s.priority : highest;
        }, story.priority);
        
        // If there's a higher priority below, adopt it
        if (priorityRank[highestPriorityBelow as keyof typeof priorityRank] < priorityRank[story.priority as keyof typeof priorityRank]) {
          newPriority = highestPriorityBelow;
        }

        return updateStoryOrder(story.$id, index, newPriority);
      })
    );

    handleRefresh();
  };

  if (loading && epics.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const selectedJourney = storyMap?.journeys.find((j) => j.$id === selectedJourneyId);

  // Group stories by release
  const groupStoriesByRelease = () => {
    if (!selectedJourney) return [];

    const groups: Array<{
      release: Release | null;
      steps: StepWithStories[];
    }> = [];

    // Add each release as a group
    releases.forEach((release) => {
      const stepsForRelease = selectedJourney.steps.map((step) => ({
        ...step,
        stories: step.stories.filter((story) => story.releaseId === release.$id),
      }));
      groups.push({ release, steps: stepsForRelease });
    });

    // Add backlog (stories without a release)
    const backlogSteps = selectedJourney.steps.map((step) => ({
      ...step,
      stories: step.stories.filter((story) => !story.releaseId),
    }));
    groups.push({ release: null, steps: backlogSteps });

    return groups;
  };

  const releaseGroups = groupStoriesByRelease();

  // Get the active story for drag overlay
  const activeStory = activeStoryId
    ? storyMap?.journeys
        .flatMap((j) => j.steps)
        .flatMap((s) => s.stories)
        .find((story) => story.$id === activeStoryId)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Story Map</h1>
            <p className="text-muted-foreground">
              Visualize user journeys and prioritize features
            </p>
          </div>
        </div>

        {/* Epic Selector */}
        <div className="flex items-center justify-between bg-background rounded-lg p-4 shadow-sm">
          <EpicSelector
            epics={epics}
            selectedEpicId={selectedEpicId}
            onSelectEpic={handleEpicChange}
            onRefresh={handleRefresh}
          />
          <AddEpicDialog onSuccess={handleRefresh} />
        </div>

        {/* Journey Selector */}
        {storyMap && (
          <div className="bg-background rounded-lg p-4 shadow-sm">
            <JourneySelector
              journeys={storyMap.journeys}
              selectedJourneyId={selectedJourneyId}
              epicId={selectedEpicId!}
              onSelectJourney={setSelectedJourneyId}
              onRefresh={handleRefresh}
            />
          </div>
        )}

        {/* Release Lanes */}
        {selectedJourney ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-6">
              {releaseGroups.map((group, index) => (
                <ReleaseLane
                  key={group.release?.$id || 'backlog'}
                  release={group.release}
                  steps={group.steps}
                  allReleases={releases}
                  onRefresh={handleRefresh}
                  journeyId={selectedJourney.$id}
                />
              ))}

              {/* Add Release Button */}
              <AddReleaseDialog
                journeyId={selectedJourney.$id}
                order={releases.length}
                onSuccess={handleRefresh}
              />
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeStory ? (
                <div className="opacity-90 rotate-3">
                  <div className="p-3 bg-background border-2 border-primary rounded-lg shadow-2xl">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{activeStory.title}</h4>
                    </div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : storyMap && storyMap.journeys.length > 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Select a journey to view the story map</p>
          </div>
        ) : selectedEpicId ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No user journeys yet. Add one to get started!</p>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Create an epic to start building your story map</p>
          </div>
        )}
      </div>
    </div>
  );
}
