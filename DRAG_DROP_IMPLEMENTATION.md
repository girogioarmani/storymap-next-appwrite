# Drag & Drop Implementation

## Overview
The Story Map now supports comprehensive drag-and-drop functionality for moving stories between:
- **Steps** (horizontal columns within a journey)
- **Releases** (horizontal swim lanes)
- **Within the same step** (reordering)

## Features Implemented

### 1. **Enhanced Actions**
- `updateStoryPlacement()` - New action to update a story's step, release, order, and priority in one call

### 2. **Intelligent Drag Handler**
The `handleDragEnd` function in `StoryMapView` now handles three scenarios:

#### Scenario A: Dropping on an empty step column
- Detects drop target format: `step-{stepId}-{releaseId|backlog}`
- Moves story to the target step and release
- Appends to the end of existing stories

#### Scenario B: Dropping on another story (different step/release)
- Moves story to the target step and release
- Inserts at the position of the target story
- Reorders other stories accordingly

#### Scenario C: Reordering within the same step and release
- Reorders stories using `arrayMove`
- Applies smart priority adjustment (adopts higher priority from below)

### 3. **Droppable Step Columns**
Each `StepColumn` is now a droppable zone:
- Uses unique ID format: `step-{stepId}-{releaseId}`
- Visual feedback when hovering with a story (blue highlight)
- Accepts stories from any step or release

### 4. **Visual Feedback**
- **Story cards during drag**: Opacity, scale, rotation effect
- **Drop zones**: Blue border and background when hovering
- **Drag overlay**: Shows a preview of the story being dragged with cursor

### 5. **Cross-Release Drag & Drop**
Stories can be moved between releases:
- From Release 1 → Release 2
- From Release → Backlog
- From Backlog → Release

The `releaseId` is automatically updated when dropping in a different release lane.

## Usage

### To Move a Story:
1. **Click and hold** the grip handle (⋮⋮) on any story card
2. **Drag** the story to:
   - Another story (inserts at that position)
   - An empty area in a step column (appends to end)
   - A different step in the same release
   - A different release lane entirely
3. **Drop** to complete the move

### Visual Indicators:
- **Dragging**: Story becomes semi-transparent with rotation
- **Valid Drop Zone**: Column highlights in blue
- **Drag Overlay**: Follows cursor showing what you're moving

## Technical Details

### Key Components Modified:
1. **`story-map-view.tsx`** - Main drag-and-drop orchestration
2. **`release-lane.tsx`** - DndContext wrapper for each release
3. **`step-column.tsx`** - Droppable zone implementation
4. **`story-card.tsx`** - Draggable story with visual feedback

### Database Updates:
When a story is moved, the following fields may be updated:
- `stepId` - Which step the story belongs to
- `releaseId` - Which release (or null for backlog)
- `order` - Position within the step
- `priority` - May be adjusted based on surrounding stories

### Priority Intelligence:
The system automatically adjusts priorities when reordering:
- If you move a "Could Have" story above a "Must Have" story, it becomes "Must Have"
- Maintains the MoSCoW priority hierarchy (Must > Should > Could > Won't)

## Future Enhancements (Optional)
- [ ] Drag handles for release reordering
- [ ] Keyboard shortcuts for story movement
- [ ] Undo/redo for drag operations
- [ ] Drag preview customization per priority
- [ ] Multi-select drag (move multiple stories at once)
