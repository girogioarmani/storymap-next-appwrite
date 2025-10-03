'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { createStory, deleteStory, updateStoryOrder, getStoriesByStep } from '@/lib/actions/storymap.actions';
import { Split, Plus, Trash2, GripVertical, HelpCircle } from 'lucide-react';
import { Story } from '@/lib/types/storymap.types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SPIDRBreakdownDialogProps {
  parentStory: Story;
  stepId: string;
  currentOrder: number;
  allStories: Story[];
  onSuccess?: () => void;
}

// Breakdown column represents a "Then" step in the breakdown
interface BreakdownColumn {
  id: string;
  order: number;
  stories: Story[];
}

const priorityConfig = {
  must: { emoji: '🔴', label: 'Must Have', color: 'bg-red-500' },
  should: { emoji: '🟡', label: 'Should Have', color: 'bg-yellow-500' },
  could: { emoji: '🟢', label: 'Could Have', color: 'bg-green-500' },
  wont: { emoji: '⚪', label: "Won't Have", color: 'bg-gray-400' },
};

// Draggable breakdown story card
function BreakdownStoryCard({ 
  story, 
  onDelete, 
  columnIndex 
}: { 
  story: Story; 
  onDelete: () => void;
  columnIndex: number;
}) {
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
    opacity: isDragging ? 0.5 : 1,
  };

  const config = priorityConfig[story.priority as keyof typeof priorityConfig] || priorityConfig.should;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-2 group relative hover:shadow-md transition-shadow bg-background"
    >
      <div className="flex items-start gap-2">
        <button
          className="cursor-grab active:cursor-grabbing mt-1 text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3 w-3" />
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs">{config.emoji}</span>
                <h4 className="font-medium text-xs leading-tight">{story.title}</h4>
              </div>
              {story.description && !story.description.includes('[SPIDR:') && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {story.description}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Add story form in a column
function AddBreakdownStory({ 
  columnIndex, 
  onAdd,
  parentPriority,
}: { 
  columnIndex: number; 
  onAdd: (title: string, priority: Story['priority']) => Promise<void>;
  parentPriority: Story['priority'];
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Story['priority']>(parentPriority);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onAdd(title, priority);
    setTitle('');
    setAdding(false);
  };

  if (!adding) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setAdding(true)}
        className="w-full text-xs gap-1 h-7"
      >
        <Plus className="h-3 w-3" />
        Add OR Option
      </Button>
    );
  }

  return (
    <Card className="p-2 bg-accent/20">
      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          placeholder="Story title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-7 text-xs"
          autoFocus
        />
        <div className="flex items-center gap-2">
          <Select value={priority} onValueChange={(v) => setPriority(v as Story['priority'])}>
            <SelectTrigger className="h-6 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(priorityConfig).map(([key, config]) => (
                <SelectItem key={key} value={key} className="text-xs">
                  {config.emoji} {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-1">
          <Button type="submit" size="sm" className="h-6 text-xs flex-1">
            Add
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setAdding(false);
              setTitle('');
            }}
            className="h-6 text-xs"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function SPIDRBreakdownDialog({
  parentStory,
  stepId,
  currentOrder,
  allStories,
  onSuccess,
}: SPIDRBreakdownDialogProps) {
  const [open, setOpen] = useState(false);
  const [columns, setColumns] = useState<BreakdownColumn[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Load breakdown stories when dialog opens
  const loadBreakdownStories = useCallback(async () => {
    console.log('🔄 Loading breakdown stories for parent:', parentStory.$id);
    
    // Fetch fresh stories from database
    const result = await getStoriesByStep(stepId);
    console.log('📦 Fetched stories from DB:', result.data?.length);
    
    if (!result.success || !result.data) {
      console.log('❌ Failed to fetch stories or no data');
      return;
    }

    // DEBUG: Log all story descriptions
    console.log('🔍 All stories in this step:');
    (result.data as Story[]).forEach(story => {
      console.log(`  - "${story.title}": description = "${story.description}"`);
    });
    
    console.log(`🔎 Looking for SPIDR tag pattern: [SPIDR:${parentStory.$id}:COL:`);

    // Find all stories that are breakdowns of this parent story
    // Match pattern: [SPIDR:parentId:COL:columnIndex]
    const breakdownStories = (result.data as Story[]).filter(story => 
      story.description?.includes(`[SPIDR:${parentStory.$id}:COL:`)
    );
    
    console.log('🎯 Filtered breakdown stories:', breakdownStories.length, breakdownStories.map(s => ({ title: s.title, desc: s.description })));

    // Group stories by column (using metadata in description)
    const columnMap = new Map<number, Story[]>();
    
    breakdownStories.forEach(story => {
      const match = story.description?.match(/\[SPIDR:[^\]]+:COL:(\d+)\]/);
      const colIndex = match ? parseInt(match[1]) : 0;
      
      console.log(`📍 Story "${story.title}" assigned to column ${colIndex}`);
      
      if (!columnMap.has(colIndex)) {
        columnMap.set(colIndex, []);
      }
      columnMap.get(colIndex)!.push(story);
    });

    // Sort stories within each column by order
    columnMap.forEach(stories => stories.sort((a, b) => a.order - b.order));

    // Create columns
    const cols: BreakdownColumn[] = [];
    const maxCol = Math.max(...Array.from(columnMap.keys()), 0);
    
    for (let i = 0; i <= maxCol; i++) {
      cols.push({
        id: `col-${i}`,
        order: i,
        stories: columnMap.get(i) || [],
      });
    }

    // Ensure at least one column
    if (cols.length === 0) {
      cols.push({ id: 'col-0', order: 0, stories: [] });
    }

    console.log('✅ Setting columns:', cols.map(c => ({ id: c.id, stories: c.stories.length })));
    setColumns(cols);
    setRefreshKey(prev => prev + 1); // Force re-render
  }, [stepId, parentStory.$id]);

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      await loadBreakdownStories();
    } else {
      // When modal closes, refresh the parent to show any changes
      onSuccess?.();
    }
  };

  const addColumn = () => {
    const newCol: BreakdownColumn = {
      id: `col-${columns.length}`,
      order: columns.length,
      stories: [],
    };
    setColumns([...columns, newCol]);
  };

  const addStoryToColumn = async (columnIndex: number, title: string, priority: Story['priority']) => {
    console.log('➕ Adding story to column', columnIndex, ':', title);
    setLoading(true);
    
    try {
      const validPriorities = ['must', 'should', 'could', 'wont'] as const;
      const safePriority = validPriorities.includes(priority as any) ? priority : 'should';

      // Add metadata to description to track breakdown relationship and column
      const description = `[SPIDR:${parentStory.$id}:COL:${columnIndex}]`;
      
      console.log('📝 Story description:', description);
      
      // Calculate order - add to end of column
      const maxOrder = Math.max(...columns[columnIndex].stories.map(s => s.order), currentOrder);
      
      console.log('📊 Calculated order:', maxOrder + 1);
      
      const result = await createStory({
        title,
        description,
        stepId,
        priority: safePriority,
        order: maxOrder + 1,
      });

      console.log('💾 Create story result:', result);

      if (result.success) {
        console.log('✅ Story created successfully, waiting for DB propagation...');
        // Small delay to ensure database has propagated the change
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('🔄 Now reloading breakdown stories...');
        // Reload breakdown stories to show the newly created one
        await loadBreakdownStories();
        // NOTE: Don't call onSuccess here to prevent parent refresh which would reset modal state
        // The parent will be refreshed when the modal closes
      } else {
        console.error('❌ Failed to create story:', result.error);
      }
    } catch (error) {
      console.error('❌ Error in addStoryToColumn:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBreakdownStory = async (storyId: string) => {
    if (!confirm('Delete this breakdown story?')) return;
    
    setLoading(true);
    try {
      await deleteStory(storyId);
      await loadBreakdownStories();
      // NOTE: Don't call onSuccess here to prevent parent refresh during editing
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent, columnIndex: number) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const columnStories = columns[columnIndex].stories;
    const oldIndex = columnStories.findIndex(s => s.$id === active.id);
    const newIndex = columnStories.findIndex(s => s.$id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newStories = arrayMove(columnStories, oldIndex, newIndex);

    // Smart priority adjustment
    const priorityRank = { must: 0, should: 1, could: 2, wont: 3 };
    
    await Promise.all(
      newStories.map((story, index) => {
        let newPriority = story.priority;
        
        const storiesBelow = newStories.slice(index + 1);
        const highestPriorityBelow = storiesBelow.reduce((highest, s) => {
          return priorityRank[s.priority] < priorityRank[highest] ? s.priority : highest;
        }, story.priority);
        
        if (priorityRank[highestPriorityBelow] < priorityRank[story.priority]) {
          newPriority = highestPriorityBelow;
        }

        return updateStoryOrder(story.$id, index, newPriority);
      })
    );

    await loadBreakdownStories();
  };

  const totalBreakdowns = columns.reduce((sum, col) => sum + col.stories.length, 0);

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full text-xs gap-1">
          <Split className="h-3 w-3" />
          SPIDR Breakdown
          {totalBreakdowns > 0 && (
            <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
              {totalBreakdowns}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[98vw] w-[98vw] max-h-[95vh] h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2 mb-2">
                <Split className="h-5 w-5" />
                SPIDR Breakdown: {parentStory.title}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mb-2">
                Break down this story into sequential steps (THEN) with alternative options (OR) within each step
              </p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <HelpCircle className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-md p-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">SPIDR Breakdown Guide</h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="font-medium text-purple-500">💡 Spike - Research & Exploration</p>
                        <p className="text-muted-foreground">Time-boxed investigations, proof of concepts, or learning needed before implementation</p>
                      </div>
                      <div>
                        <p className="font-medium text-blue-500">🛤️ Path - Alternative Workflows</p>
                        <p className="text-muted-foreground">Different user journeys or flows (happy path, error cases, edge cases)</p>
                      </div>
                      <div>
                        <p className="font-medium text-green-500">🖥️ Interface - UI Variations</p>
                        <p className="text-muted-foreground">Different interfaces, devices, or presentation layers (mobile, desktop, API)</p>
                      </div>
                      <div>
                        <p className="font-medium text-orange-500">🗄️ Data - Data Scenarios</p>
                        <p className="text-muted-foreground">Different data states, sources, or CRUD operations (create, read, update, delete)</p>
                      </div>
                      <div>
                        <p className="font-medium text-red-500">⚖️ Rules - Business Logic</p>
                        <p className="text-muted-foreground">Different business rules, validations, or conditional logic paths</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t text-xs text-muted-foreground">
                      <p className="font-medium mb-1">How to use this dialog:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Each column = a sequential THEN step</li>
                        <li>Within each column = OR alternatives</li>
                        <li>Drag stories to reorder priorities</li>
                      </ul>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-x-auto overflow-y-auto py-4" key={refreshKey}>
          <div className="flex items-start gap-0 min-w-min">
            {columns.map((column, columnIndex) => (
              <div key={column.id} className="flex items-start">
                {/* Column */}
                <Card className="w-[320px] shrink-0 p-3 bg-accent/20">
                  <div className="mb-3">
                    <h3 className="font-semibold text-sm mb-1">
                      {columnIndex === 0 ? 'First Step' : `Then Step ${columnIndex + 1}`}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {column.stories.length} option{column.stories.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="space-y-0 min-h-[100px]">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => handleDragEnd(event, columnIndex)}
                    >
                      <SortableContext
                        items={column.stories.map(s => s.$id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {column.stories.map((story, storyIndex) => (
                          <div key={story.$id}>
                            <BreakdownStoryCard
                              story={story}
                              columnIndex={columnIndex}
                              onDelete={() => deleteBreakdownStory(story.$id)}
                            />
                            {storyIndex < column.stories.length - 1 && (
                              <div className="flex items-center justify-center py-1">
                                <div className="bg-amber-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                                  OR
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </SortableContext>
                    </DndContext>

                    <div className="mt-2">
                      <AddBreakdownStory
                        columnIndex={columnIndex}
                        onAdd={(title, priority) => addStoryToColumn(columnIndex, title, priority)}
                        parentPriority={parentStory.priority}
                      />
                    </div>
                  </div>
                </Card>

                {/* THEN indicator */}
                {columnIndex < columns.length - 1 && (
                  <div className="flex flex-col items-center justify-center px-3 pt-16">
                    <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold mb-2">
                      THEN
                    </div>
                    <div className="text-muted-foreground text-2xl">→</div>
                  </div>
                )}
              </div>
            ))}

            {/* Add Column Button */}
            <div className="flex items-center justify-center px-4 pt-16">
              <Button
                variant="outline"
                size="sm"
                onClick={addColumn}
                disabled={loading}
                className="h-32 w-32 flex flex-col gap-2"
              >
                <Plus className="h-6 w-6" />
                <span className="text-xs">Add THEN Step</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="bg-muted p-3 rounded-md">
            <p className="font-medium text-xs mb-1">💡 SPIDR Breakdown Tips:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li><strong>Horizontal (THEN):</strong> Sequential steps that happen in order</li>
              <li><strong>Vertical (OR):</strong> Alternative ways to implement the same step</li>
              <li>Drag stories to reorder and auto-adjust priorities</li>
              <li>Each breakdown story appears in the main story map</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
