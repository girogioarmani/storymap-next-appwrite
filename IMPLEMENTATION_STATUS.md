# Implementation Status - SPIDR & Releases

**Date:** 2025-10-02  
**Status:** ✅ Phase 1 Complete, Phase 2 In Progress

---

## ✅ Phase 1: SPIDR Breakdown Fixes (COMPLETE)

### 1. Filtered Breakdown Stories from Main View
- **File:** `lib/actions/storymap.actions.ts`
- **Change:** Stories with `[SPIDR:` in description are now filtered out from main journey view
- **Result:** Breakdown stories only appear in the breakdown modal, not in the main story map

### 2. Added Breakdown Indicator Badge
- **File:** `components/storymap/story-card.tsx`
- **Change:** Added badge with count showing how many breakdown stories exist
- **Visual:** Shows `[Split Icon] 3` badge next to story title if it has breakdowns
- **Tooltip:** "3 SPIDR breakdowns" on hover

### 3. Database Schema for Releases
- **Migration:** `scripts/add-releases-schema.js`
- **Collection Added:** `releases`
  - Fields: name, description, journeyId, userId, order, createdAt
- **Stories Updated:** Added `releaseId` field (nullable)
- **Indexes:** Added for better query performance
- **Status:** ✅ Migration ran successfully

---

## 🚧 Phase 2: Releases UI (IN PROGRESS)

### What Releases Feature Does:
Releases are **horizontal swim lanes** that span across all steps in a journey. Think of them like this:

```
Journey: User Registration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ MVP Release ┃
┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃
┃  [Step 1]      [Step 2]      [Step 3]        ┃
┃  - Story A     - Story C      - Story E       ┃
┃  - Story B     - Story D                      ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┃ Release 2 ┃
┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃
┃  [Step 1]      [Step 2]      [Step 3]        ┃
┃  - Story F     - Story G      - Story H       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### Next Steps Required:

#### 1. Update Environment Variables
Add to `.env.local`:
```bash
NEXT_PUBLIC_APPWRITE_COLLECTION_RELEASES=releases
```

#### 2. Update TypeScript Types
File: `lib/types/storymap.types.ts`
```typescript
export interface Release extends Models.Document {
  name: string;
  description: string;
  journeyId: string;
  userId: string;
  order: number;
  createdAt: string;
}

// Update Story interface to include releaseId
export interface Story extends Models.Document {
  title: string;
  description: string;
  stepId: string;
  userId: string;
  priority: 'must' | 'should' | 'could' | 'wont';
  order: number;
  releaseId?: string; // NEW FIELD
  createdAt: string;
}

// Update JourneyWithSteps to include releases
export interface JourneyWithStepsAndReleases extends UserJourney {
  steps: StepWithStories[];
  releases: Release[];
}
```

#### 3. Create Release CRUD Actions
File: `lib/actions/release.actions.ts` (NEW FILE)
```typescript
// Create, Read, Update, Delete for releases
// Get releases by journey
// Update story's releaseId
```

#### 4. Create Release Management Components
Files needed:
- `components/storymap/add-release-dialog.tsx` - Dialog to create new release
- `components/storymap/release-lane.tsx` - The horizontal swim lane component
- `components/storymap/release-selector.tsx` - Dropdown to filter by release

#### 5. Update StoryMapView Component
File: `components/storymap/story-map-view.tsx`
- Load releases for the journey
- Display stories grouped by release
- Each release = horizontal band spanning all steps
- Stories can be dragged between releases

#### 6. Update Story Creation/Update
Files: `components/storymap/add-story-dialog.tsx`, `story-card.tsx`
- Add release selector when creating/editing story
- Allow assigning story to a release

---

## 🎯 Visual Design for Releases

### Layout Structure:
```
[Epic Selector] [Journey Selector]

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🎯 MVP Release                [Edit] [×]   ┃
┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃
┃ [Step 1] → THEN → [Step 2] → THEN → [Step 3] ┃
┃   🔴Story1           🔴Story3       🟡Story5   ┃
┃   🟡Story2           🟢Story4                  ┃
┃      OR                 OR                     ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🚀 Release 2                 [Edit] [×]   ┃
┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃
┃ [Step 1] → THEN → [Step 2] → THEN → [Step 3] ┃
┃   🟢Story6           🟢Story7       ⚪Story8   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

[+ Add Release]

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📦 Backlog (No Release)                   ┃
┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃
┃ [Step 1] → THEN → [Step 2] → THEN → [Step 3] ┃
┃   ⚪Story9           ⚪Story10                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### Key Features:
1. **Horizontal Bands:** Each release is a colored band spanning all steps
2. **Release Header:** Name, description, edit/delete buttons
3. **Stories Within Release:** Only show stories assigned to that release
4. **Backlog Section:** Stories without a release go here
5. **Drag & Drop:** Drag stories between releases
6. **Add Release Button:** Creates new release at any position

---

## 📦 Files Summary

### ✅ Completed Files:
1. `lib/actions/storymap.actions.ts` - Filtered SPIDR stories
2. `components/storymap/story-card.tsx` - Added breakdown badge
3. `components/storymap/spidr-breakdown-dialog.tsx` - Full breakdown modal
4. `scripts/add-releases-schema.js` - Database migration

### 🚧 Files Needed:
1. `lib/types/storymap.types.ts` - Add Release interface
2. `lib/actions/release.actions.ts` - Release CRUD operations
3. `components/storymap/add-release-dialog.tsx` - Create release UI
4. `components/storymap/release-lane.tsx` - Horizontal swim lane
5. `components/storymap/story-map-view.tsx` - Update to show releases
6. `components/storymap/add-story-dialog.tsx` - Add release selector
7. `.env.local` - Add NEXT_PUBLIC_APPWRITE_COLLECTION_RELEASES

---

## 🎨 UI/UX Details

### Release Lane Component:
- **Background:** Subtle gradient or solid color
- **Border:** Rounded corners, soft shadow
- **Header:** 
  - Release emoji (🎯 MVP, 🚀 R1, ✨ R2, etc.)
  - Release name (editable inline)
  - Story count badge
  - Edit/Delete buttons (on hover)
- **Content Area:**
  - Contains all steps horizontally
  - Stories appear in their respective steps
  - THEN/OR indicators work same as main view
- **Drag & Drop:**
  - Drag stories up/down to change release
  - Visual feedback on drag over
  - Drop zones highlighted

### Story Card Updates:
- **Release Badge:** Small badge showing which release (e.g., "MVP", "R2")
- **Color Coding:** Optional - story card border matches release color
- **Context Menu:** Right-click to move to different release

### Add Release Dialog:
- **Fields:**
  - Release name (required)
  - Description (optional)
  - Position/Order (auto or manual)
- **Presets:** Quick buttons for "MVP", "Phase 1", "Phase 2", etc.
- **Color Picker:** Choose release color theme

---

## 🔄 Data Flow

### Loading:
1. Load journey with `getCompleteStoryMap(epicId)`
2. Load releases for journey with `getReleasesByJourney(journeyId)`
3. Group stories by `releaseId`
4. Render release lanes in order

### Creating Story:
1. User clicks "Add Story" in a step
2. Dialog shows release selector
3. Story created with `releaseId` field
4. Appears in correct release lane

### Moving Story Between Releases:
1. User drags story from Release 1 to Release 2
2. Update story's `releaseId` field
3. Refresh view
4. Story appears in new release

---

## 🎯 Benefits of Releases Feature

1. **MVP Scoping:** Clearly define what's in MVP vs future releases
2. **Iteration Planning:** Plan multiple releases/sprints
3. **Stakeholder Communication:** Show what's coming when
4. **Priority Visualization:** See high-priority items across all steps
5. **Flexibility:** Stories can move between releases easily
6. **Backlog Management:** Unassigned stories visible in backlog

---

## 📝 Testing Checklist (After Implementation)

- [ ] Create a new release
- [ ] Add stories to a release
- [ ] Move story between releases
- [ ] Delete a release (stories become unassigned)
- [ ] Reorder releases
- [ ] Edit release name/description
- [ ] Filter stories by release
- [ ] Drag & drop between releases
- [ ] THEN/OR indicators work within releases
- [ ] Backlog section shows unassigned stories
- [ ] Release persists after page reload

---

## 🚀 Quick Start Guide (For Next Session)

1. **Add env variable:**
   ```bash
   echo 'NEXT_PUBLIC_APPWRITE_COLLECTION_RELEASES=releases' >> .env.local
   ```

2. **Restart dev server:**
   ```bash
   npm run dev
   ```

3. **Test current features:**
   - Check that SPIDR breakdown stories don't appear in main view
   - Verify breakdown count badge appears on stories
   - Test SPIDR breakdown modal

4. **Implement releases (recommended order):**
   - Update types
   - Create release actions
   - Create AddReleaseDialog component
   - Update StoryMapView to show releases
   - Add release selector to story dialogs
   - Test end-to-end

---

**Status:** Ready for Phase 2 implementation! 🎉

The database is set up, SPIDR filtering works, and we have a clear plan for the releases UI.

