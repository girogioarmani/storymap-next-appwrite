# Story Mapping Migration Guide

## Overview

The application has been restructured to follow **proper User Story Mapping methodology**:

```
Epic (e.g., "E-commerce Platform")
  └─ User Journey (e.g., "Customer Purchase Flow")
      └─ Steps [HORIZONTAL AXIS] →
          ├─ Step 1: "Browse Products"
          ├─ Step 2: "Add to Cart"  
          └─ Step 3: "Checkout"
              └─ Stories [VERTICAL AXIS, Prioritized] ↓
                  ├─ Story 1 (High priority)
                  ├─ Story 2 (Medium priority)
                  └─ Story 3 (Low priority)
```

## What Changed

### Old Structure (❌ Incorrect)
- Activities → Stories
- No horizontal flow
- No proper prioritization

### New Structure (✅ Correct)
- **Epic**: The overall feature/product (e.g., "E-commerce Platform")
- **User Journey**: A specific user flow within the epic (e.g., "Customer Purchase Flow")
- **Steps** (Horizontal): Sequential actions in the journey (e.g., "Browse" → "Add to Cart" → "Checkout")
- **Stories** (Vertical): Alternative implementations or OR choices under each step, prioritized top-to-bottom

## Database Schema

### Collections Created

1. **`epics`**
   - `name` (string): Epic name
   - `description` (string): Epic description
   - `userId` (string): Owner
   - `createdAt` (datetime)

2. **`user_journeys`**
   - `name` (string): Journey name
   - `description` (string): Journey description
   - `epicId` (string): Parent epic
   - `userId` (string): Owner
   - `order` (integer): Order in the epic
   - `createdAt` (datetime)

3. **`steps`**
   - `name` (string): Step name (e.g., "Add to Cart")
   - `description` (string): Step description
   - `journeyId` (string): Parent journey
   - `userId` (string): Owner
   - `order` (integer): Horizontal position (left to right)
   - `createdAt` (datetime)

4. **`stories`**
   - `title` (string): Story title
   - `description` (string): Story details
   - `stepId` (string): Parent step
   - `userId` (string): Owner
   - `priority` (string): high/medium/low
   - `order` (integer): Vertical position (top to bottom for prioritization)
   - `createdAt` (datetime)

### Indexes
- `epicId_idx` on user_journeys.epicId
- `journeyId_idx` on steps.journeyId
- `stepId_idx` on stories.stepId

## New API Actions

All actions are in `/lib/actions/storymap.actions.ts`:

### Epic Actions
- `createEpic(data)` - Create a new epic
- `getAllEpics()` - Get all user's epics
- `getEpic(epicId)` - Get single epic
- `deleteEpic(epicId)` - Delete epic and all descendants

### User Journey Actions
- `createUserJourney(data)` - Create journey under an epic
- `getJourneysByEpic(epicId)` - Get all journeys for an epic
- `deleteUserJourney(journeyId)` - Delete journey and descendants

### Step Actions
- `createStep(data)` - Create step under a journey
- `getStepsByJourney(journeyId)` - Get all steps for a journey (ordered)
- `updateStepOrder(stepId, newOrder)` - Reorder steps horizontally
- `deleteStep(stepId)` - Delete step and its stories

### Story Actions
- `createStory(data)` - Create story under a step
- `getStoriesByStep(stepId)` - Get all stories for a step (ordered)
- `updateStoryOrder(storyId, newOrder)` - Reorder stories vertically (for prioritization)
- `deleteStory(storyId)` - Delete a story

### Complete Data
- `getCompleteStoryMap(epicId)` - Get entire story map hierarchy in one call

## UI Requirements

### Layout Structure

```tsx
<StoryMapView>
  <EpicHeader epic={epic} />
  
  <JourneySelector journeys={journeys} />
  
  <StoryMapGrid>
    {/* Horizontal scroll for steps */}
    <StepsRow>
      {steps.map(step => (
        <StepColumn key={step.$id}>
          <StepHeader>{step.name}</StepHeader>
          
          {/* Vertical list of stories (drag & drop) */}
          <StoriesColumn>
            {step.stories.map(story => (
              <StoryCard 
                story={story}
                draggable
                priority={story.priority}
              />
            ))}
            <AddStoryButton />
          </StoriesColumn>
        </StepColumn>
      ))}
      <AddStepButton />
    </StepsRow>
  </StoryMapGrid>
</StoryMapView>
```

### Key UI Features Needed

1. **Horizontal Step Layout**
   - Use CSS Grid or Flexbox with horizontal scroll
   - Each step is a column
   - Steps should be draggable left/right (optional enhancement)

2. **Vertical Story Cards**
   - Stories stack vertically under each step
   - Must support drag & drop for re-prioritization
   - Visual indicators for priority (high/medium/low)

3. **Drag and Drop**
   - Stories can be dragged up/down within a step to change priority
   - Stories can be dragged between steps (change parent)
   - Use library like `@dnd-kit/core` or `react-beautiful-dnd`

4. **Visual Design**
   ```
   ┌─────────────────────────────────────────────────┐
   │ Epic: E-commerce Platform                       │
   │ Journey: Customer Purchase Flow                 │
   └─────────────────────────────────────────────────┘
   
   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────┐
   │ Browse   │  │ Add Cart │  │ Checkout │  │  +    │
   │ Products │  │          │  │          │  │ Step  │
   ├──────────┤  ├──────────┤  ├──────────┤  └───────┘
   │ ▓▓▓▓▓▓▓  │  │ ▓▓▓▓▓▓▓  │  │ ▓▓▓▓▓▓▓  │
   │ Story 1  │  │ Story A  │  │ Story X  │
   │ [HIGH]   │  │ [HIGH]   │  │ [HIGH]   │
   ├──────────┤  ├──────────┤  ├──────────┤
   │ ░░░░░░░  │  │ ░░░░░░░  │  │ ░░░░░░░  │
   │ Story 2  │  │ Story B  │  │ Story Y  │
   │ [MEDIUM] │  │ [LOW]    │  │ [MEDIUM] │
   ├──────────┤  └──────────┘  ├──────────┤
   │ ░░░░░░░  │                │ ░░░░░░░  │
   │ Story 3  │                │ Story Z  │
   │ [LOW]    │                │ [LOW]    │
   ├──────────┤                └──────────┘
   │   + Add  │
   │  Story   │
   └──────────┘
   ```

## Example Usage

### Creating a Complete Story Map

```typescript
// 1. Create Epic
const epic = await createEpic({
  name: "E-commerce Platform",
  description: "Complete online shopping experience"
});

// 2. Create User Journey
const journey = await createUserJourney({
  name: "Customer Purchase Flow",
  description: "How customers buy products",
  epicId: epic.data.$id,
  order: 0
});

// 3. Create Steps (horizontal)
const step1 = await createStep({
  name: "Browse Products",
  description: "User browses product catalog",
  journeyId: journey.data.$id,
  order: 0
});

const step2 = await createStep({
  name: "Add to Cart",
  journeyId: journey.data.$id,
  order: 1
});

const step3 = await createStep({
  name: "Checkout",
  journeyId: journey.data.$id,
  order: 2
});

// 4. Create Stories (vertical, prioritized)
await createStory({
  title: "Filter by category",
  description: "As a user, I want to filter products by category",
  stepId: step1.data.$id,
  priority: "high",
  order: 0  // Top priority
});

await createStory({
  title: "Sort by price",
  description: "As a user, I want to sort products by price",
  stepId: step1.data.$id,
  priority: "medium",
  order: 1  // Second priority
});

await createStory({
  title: "Product recommendations",
  description: "As a user, I want to see recommended products",
  stepId: step1.data.$id,
  priority: "low",
  order: 2  // Lowest priority
});
```

### Fetching Complete Story Map

```typescript
const result = await getCompleteStoryMap(epicId);

if (result.success) {
  const { epic, journeys } = result.data;
  
  // Access structure:
  journeys.forEach(journey => {
    console.log(`Journey: ${journey.name}`);
    
    journey.steps.forEach(step => {
      console.log(`  Step: ${step.name}`);
      
      step.stories.forEach(story => {
        console.log(`    Story: ${story.title} (${story.priority})`);
      });
    });
  });
}
```

## Migration Steps

### For Existing Data (if any)

1. **Backup**: Export any existing activities/stories
2. **Run Setup**: Execute the schema setup script
3. **Migrate Data**: 
   - Convert activities → epics
   - Create a default journey per epic
   - Convert activity stories → step stories
4. **Test**: Verify all data migrated correctly

### For New Implementation

1. ✅ **Schema Created**: Run `/scripts/setup-storymap-schema.js`
2. ✅ **Actions Created**: All CRUD operations in `/lib/actions/storymap.actions.ts`
3. 🔄 **UI Needed**: Build components (see UI Requirements above)
4. 🔄 **Page Update**: Rebuild `/app/page.tsx` with new structure
5. 🔄 **Dialogs**: Create dialogs for creating epics, journeys, steps, stories
6. 🔄 **Drag & Drop**: Implement with `@dnd-kit/core`

## Recommended Packages

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

For drag and drop functionality.

## Next Steps

1. **Install drag-drop library**: 
   ```bash
   npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
   ```

2. **Create UI Components**:
   - `components/storymap/epic-selector.tsx`
   - `components/storymap/journey-selector.tsx`
   - `components/storymap/step-column.tsx`
   - `components/storymap/story-card.tsx`
   - `components/storymap/add-step-dialog.tsx`
   - `components/storymap/add-story-dialog.tsx`

3. **Update Main Page**: 
   - Replace `/app/page.tsx` with new story map view

4. **Add Drag & Drop**:
   - Implement vertical story reordering
   - Implement horizontal step reordering
   - Update orders via `updateStoryOrder()` and `updateStepOrder()`

5. **Test Complete Flow**:
   - Create epic → journey → steps → stories
   - Drag stories to reprioritize
   - Delete items and verify cascade

## Visual Example

Real-world example for "Booking App":

```
Epic: Flight Booking System

Journey: Book a Flight
┌────────────┬────────────┬────────────┬────────────┐
│ Search     │ Select     │ Passenger  │ Payment    │
│ Flights    │ Flight     │ Details    │            │
├────────────┼────────────┼────────────┼────────────┤
│ 🔴 Filter  │ 🔴 Compare │ 🔴 Enter   │ 🔴 Pay     │
│    by date │    prices  │    info    │    card    │
├────────────┼────────────┼────────────┼────────────┤
│ 🟡 Filter  │ 🟡 View    │ 🟡 Save    │ 🟡 PayPal  │
│    by      │    details │    profile │            │
│    price   │            │            │            │
├────────────┼────────────┼────────────┼────────────┤
│ 🟢 Sort by │ 🟢 Check   │ 🟢 Add     │ 🟢 Apple   │
│    airline │    reviews │    extras  │    Pay     │
└────────────┴────────────┴────────────┴────────────┘

🔴 = High Priority (Must have)
🟡 = Medium Priority (Should have)  
🟢 = Low Priority (Nice to have)
```

This structure allows teams to:
1. See the user journey horizontally (left to right)
2. Prioritize features vertically (top to bottom)
3. Identify MVP vs. future enhancements
4. Facilitate release planning

---

**Status**: ✅ Database ready | ✅ Actions ready | 🔄 UI pending

**Files**:
- Schema: `/scripts/setup-storymap-schema.js`
- Actions: `/lib/actions/storymap.actions.ts`
- Migration: This document
