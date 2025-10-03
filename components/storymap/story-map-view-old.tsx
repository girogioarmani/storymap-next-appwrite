'use client';

import { useState, useCallback, useEffect } from 'react';
import { CompleteStoryMap } from '@/lib/types/storymap.types';
import { Epic } from '@/lib/types/storymap.types';
import { EpicSelector } from './epic-selector';
import { AddEpicDialog } from './add-epic-dialog';
import { JourneySelector } from './journey-selector';
import { StepColumn } from './step-column';
import { AddStepDialog } from './add-step-dialog';
import { getAllEpics, getCompleteStoryMap } from '@/lib/actions/storymap.actions';
import { updateStoryOrder } from '@/lib/actions/storymap.actions';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

export function StoryMapView() {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null);
  const [storyMap, setStoryMap] = useState<CompleteStoryMap | null>(null);
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
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

  useEffect(() => {
    loadEpics();
  }, []);

  useEffect(() => {
    loadStoryMap();
  }, [selectedEpicId]);

  const handleRefresh = useCallback(() => {
    loadEpics();
    loadStoryMap();
  }, [loadEpics, loadStoryMap]);

  const handleEpicChange = (epicId: string) => {
    setSelectedEpicId(epicId);
    setSelectedJourneyId(null);
    setStoryMap(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // Find which step contains these stories
    const activeStory = storyMap?.journeys
      .flatMap((j) => j.steps)
      .flatMap((s) => s.stories)
      .find((story) => story.$id === active.id);

    const overStory = storyMap?.journeys
      .flatMap((j) => j.steps)
      .flatMap((s) => s.stories)
      .find((story) => story.$id === over.id);

    if (!activeStory || !overStory) return;

    // Only handle reordering within the same step
    if (activeStory.stepId !== overStory.stepId) return;

    // Find the step
    const step = storyMap?.journeys
      .flatMap((j) => j.steps)
      .find((s) => s.$id === activeStory.stepId);

    if (!step) return;

    const oldIndex = step.stories.findIndex((s) => s.$id === active.id);
    const newIndex = step.stories.findIndex((s) => s.$id === over.id);

    const newStories = arrayMove(step.stories, oldIndex, newIndex);

    // Priority hierarchy: must > should > could > wont
    const priorityRank = { must: 0, should: 1, could: 2, wont: 3 };

    // Smart priority adjustment: if moving above a higher priority, adopt that priority
    await Promise.all(
      newStories.map((story, index) => {
        let newPriority = story.priority;
        
        // Check if there's a higher priority story below this one
        const storiesBelow = newStories.slice(index + 1);
        const highestPriorityBelow = storiesBelow.reduce((highest, s) => {
          return priorityRank[s.priority] < priorityRank[highest] ? s.priority : highest;
        }, story.priority);
        
        // If there's a higher priority below, adopt it
        if (priorityRank[highestPriorityBelow] < priorityRank[story.priority]) {
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

        {/* Story Map Grid */}
        {selectedJourney ? (
          <div className="bg-background rounded-lg p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">{selectedJourney.name}</h2>
              {selectedJourney.description && (
                <p className="text-sm text-muted-foreground">
                  {selectedJourney.description}
                </p>
              )}
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="overflow-x-auto pb-4">
                <div className="flex items-start gap-0 min-w-min">
                  {selectedJourney.steps.map((step, index) => (
                    <div key={step.$id} className="flex items-start">
                      <StepColumn
                        step={step}
                        onRefresh={handleRefresh}
                      />
                      {index < selectedJourney.steps.length - 1 && (
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
                    journeyId={selectedJourney.$id}
                    order={selectedJourney.steps.length}
                    onSuccess={handleRefresh}
                  />
                </div>
              </div>
            </DndContext>
          </div>
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
