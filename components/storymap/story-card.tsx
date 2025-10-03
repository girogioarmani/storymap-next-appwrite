'use client';

import { Story } from '@/lib/types/storymap.types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2, Split } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { deleteStory } from '@/lib/actions/storymap.actions';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SPIDRBreakdownDialog } from './spidr-breakdown-dialog';
import { EditStoryDialog } from './edit-story-dialog';

interface StoryCardProps {
  story: Story;
  allStories: Story[];
  onRefresh: () => void;
}

const priorityConfig = {
  must: { emoji: '🔴', label: 'Must Have', variant: 'destructive' as const, color: 'bg-red-500' },
  should: { emoji: '🟡', label: 'Should Have', variant: 'default' as const, color: 'bg-yellow-500' },
  could: { emoji: '🟢', label: 'Could Have', variant: 'secondary' as const, color: 'bg-green-500' },
  wont: { emoji: '⚪', label: "Won't Have", variant: 'outline' as const, color: 'bg-gray-400' },
};

export function StoryCard({ story, allStories, onRefresh }: StoryCardProps) {
  const [deleting, setDeleting] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: story.$id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = async () => {
    if (!confirm('Delete this story?')) return;

    setDeleting(true);
    try {
      const result = await deleteStory(story.$id);
      if (result.success) {
        onRefresh();
      }
    } catch (error) {
      console.error('Delete story error:', error);
    } finally {
      setDeleting(false);
    }
  };

  // Get priority config with fallback for old priority values
  const config = priorityConfig[story.priority as keyof typeof priorityConfig] || priorityConfig.should;

  // Debug log if priority is invalid
  if (!priorityConfig[story.priority as keyof typeof priorityConfig]) {
    console.warn(`Story "${story.title}" has invalid priority: "${story.priority}". Defaulting to "should".`);
  }

  // Count breakdown stories for this story
  const breakdownCount = allStories.filter(s => 
    s.description?.includes(`[SPIDR:${story.$id}]`)
  ).length;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-3 group relative hover:shadow-md transition-all bg-background ${
        isDragging ? 'opacity-50 shadow-lg scale-105 rotate-2 cursor-grabbing' : 'opacity-100'
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          className="cursor-grab active:cursor-grabbing mt-1 text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-1 flex-1">
              <h4 className="font-medium text-sm leading-tight">{story.title}</h4>
              {breakdownCount > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-xs h-4 px-1 shrink-0">
                        <Split className="h-2.5 w-2.5 mr-0.5" />
                        {breakdownCount}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{breakdownCount} SPIDR breakdown{breakdownCount !== 1 ? 's' : ''}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant={config.variant} className="text-xs shrink-0">
                      {config.emoji}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{config.label} Priority</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <EditStoryDialog story={story} onSuccess={onRefresh} />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {story.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {story.description}
            </p>
          )}
          
          <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <SPIDRBreakdownDialog
              parentStory={story}
              stepId={story.stepId}
              currentOrder={story.order}
              allStories={allStories}
              onSuccess={onRefresh}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
