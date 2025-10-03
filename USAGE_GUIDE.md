# StoryMap Usage Guide

## 🎉 Your Story Mapping App is Ready!

The application has been completely rebuilt with proper User Story Mapping structure. You can now access it at **http://localhost:3000**

## 🔐 Authentication

**Login Credentials:**
- Email: `marc@marcneves.com`
- Password: `Ninjapiggy321!`

## 📋 How to Use

### 1. Create an Epic

An Epic represents a large feature or product area (e.g., "E-commerce Platform", "Mobile Banking App").

**Steps:**
1. Click **"New Epic"** button in the top right
2. Enter epic name (e.g., "E-commerce Platform")
3. Add description (optional)
4. Click **"Create Epic"**

### 2. Create a User Journey

A User Journey describes a complete user workflow (e.g., "Customer Purchase Flow").

**Steps:**
1. Select your epic from the dropdown
2. Click **"Add Journey"**
3. Enter journey name (e.g., "Customer Purchase Flow")
4. Add description (optional)
5. Click **"Create Journey"**

### 3. Add Steps (Horizontal Axis)

Steps represent sequential actions in the user journey.

**Example steps for "Customer Purchase Flow":**
- Step 1: "Browse Products"
- Step 2: "Add to Cart"
- Step 3: "Checkout"

**Steps:**
1. Select a journey from the tabs
2. Click the **"+ Add Step"** card
3. Enter step name and description
4. Click **"Add Step"**

### 4. Add Stories (Vertical Axis)

Stories are implementation options or features for each step, prioritized vertically.

**Example stories for "Browse Products" step:**
- 🔴 High: "Filter by category" (Must have)
- 🟡 Medium: "Sort by price" (Should have)
- 🟢 Low: "Product recommendations" (Nice to have)

**Steps:**
1. In a step column, click **"+ Add Story"**
2. Enter story title (e.g., "Filter by category")
3. Add description
4. Select priority (High/Medium/Low)
5. Click **"Add Story"**

### 5. Prioritize with Drag & Drop ✨

**Reorder stories vertically:**
1. Click and hold the **grip icon** (≡) on a story card
2. Drag the story up or down
3. Release to drop in new position
4. Priority order is saved automatically

**This lets you:**
- Place high-priority stories at the top
- Medium-priority in the middle
- Low-priority at the bottom

## 🎯 Story Mapping Structure

```
Epic: E-commerce Platform
  └─ Journey: Customer Purchase Flow
      └─ Steps (Horizontal →)
          ├─ Browse Products
          │   └─ Stories (Vertical ↓)
          │       ├─ 🔴 Filter by category (Must have)
          │       ├─ 🟡 Sort by price (Should have)
          │       └─ 🟢 Recommendations (Nice to have)
          │
          ├─ Add to Cart
          │   └─ Stories
          │       ├─ 🔴 Select quantity
          │       ├─ 🟡 Save for later
          │       └─ 🟢 Related products
          │
          └─ Checkout
              └─ Stories
                  ├─ 🔴 Credit card payment
                  ├─ 🟡 PayPal
                  └─ 🟢 Apple Pay
```

## 🗑️ Deleting Items

- **Delete Epic**: Click trash icon next to epic selector (deletes everything!)
- **Delete Journey**: Hover over journey tab, click small trash icon
- **Delete Step**: Click trash icon in step header
- **Delete Story**: Hover over story card, click trash icon (appears on hover)

⚠️ **Warning**: Deleting an epic, journey, or step will cascade delete all children!

## 💡 Key Features

### Priority Indicators
- 🔴 **Red** = High Priority (Must have)
- 🟡 **Yellow** = Medium Priority (Should have)
- 🟢 **Green** = Low Priority (Nice to have)

### Drag & Drop
- Stories can be dragged vertically within a step
- Reordering updates priority automatically
- Visual feedback during drag

### Horizontal Scrolling
- Story map scrolls horizontally for many steps
- Maintains all steps visible

### Responsive Design
- Works on desktop and tablets
- Optimized for large screens

## 🚀 Workflow Example

**Creating a complete story map for an e-commerce site:**

1. **Create Epic**: "E-commerce Platform"
2. **Create Journey**: "Customer Purchase Flow"
3. **Add Steps** (left to right):
   - "Browse Products"
   - "Product Details"
   - "Add to Cart"
   - "Checkout"
   - "Order Confirmation"

4. **Add Stories** (for each step, top to bottom by priority):

**Browse Products:**
- 🔴 Search functionality
- 🔴 Category filters
- 🟡 Sort options
- 🟢 Personalized recommendations

**Product Details:**
- 🔴 Product images
- 🔴 Add to cart button
- 🟡 Customer reviews
- 🟢 Related products

**Add to Cart:**
- 🔴 Quantity selection
- 🟡 Save for later
- 🟢 Continue shopping

**Checkout:**
- 🔴 Shipping info form
- 🔴 Payment options
- 🟡 Order summary
- 🟢 Apply coupon code

**Order Confirmation:**
- 🔴 Order number display
- 🔴 Confirmation email
- 🟡 Track order link
- 🟢 Share on social media

5. **Prioritize**: Drag stories to reorder them based on importance

6. **Plan Releases**: 
   - MVP: All 🔴 high-priority stories
   - Release 2: Add 🟡 medium-priority stories
   - Release 3: Add 🟢 low-priority stories

## 🎨 Visual Layout

```
┌─────────────────────────────────────────────┐
│ Story Map                                   │
│ Visualize user journeys and prioritize     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 🎯 E-commerce Platform          [New Epic]  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ [📍 Customer Purchase Flow] [Add Journey]   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Customer Purchase Flow                      │
│                                             │
│ <──── Horizontal Scroll ────>               │
│                                             │
│ ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐       │
│ │Browse│  │ Add │  │Check│  │  +  │       │
│ │  🔴  │  │  🔴 │  │  🔴 │  │Step │       │
│ │  🟡  │  │  🟡 │  │  🟡 │  └─────┘       │
│ │  🟢  │  │  🟢 │  │  🟢 │                │
│ │  +   │  │  +  │  │  +  │                │
│ └─────┘  └─────┘  └─────┘                 │
└─────────────────────────────────────────────┘
```

## 🔧 Technical Details

### Components Created
- `EpicSelector` - Select/manage epics
- `AddEpicDialog` - Create new epics
- `JourneySelector` - Tabbed journey navigation
- `AddJourneyDialog` - Create new journeys
- `StepColumn` - Individual step with stories
- `AddStepDialog` - Create new steps
- `StoryCard` - Draggable story card
- `AddStoryDialog` - Create new stories
- `StoryMapView` - Main view component

### Database Collections
- `epics` - Top-level features
- `user_journeys` - User workflows
- `steps` - Sequential actions
- `stories` - Implementation options

### API Actions
All CRUD operations in `/lib/actions/storymap.actions.ts`

### Drag & Drop
- Powered by `@dnd-kit/core`
- Vertical sorting within steps
- Automatic order updates

## 📖 Story Mapping Methodology

This structure follows Jeff Patton's User Story Mapping technique:

1. **Horizontal axis** = User journey flow (left to right)
2. **Vertical axis** = Priority/Options (top to bottom)
3. **Top stories** = MVP (Minimum Viable Product)
4. **Lower stories** = Future enhancements

**Benefits:**
- Visualize complete user journey
- Prioritize features effectively
- Identify MVP vs. nice-to-haves
- Facilitate release planning
- Enable better team discussions

## 🆘 Troubleshooting

### Can't see stories?
- Make sure you've selected an epic and journey
- Check that you've added at least one step

### Drag & drop not working?
- Make sure you're grabbing the grip icon (≡)
- Only works within the same step column

### Stories not updating?
- Check browser console for errors
- Verify you're logged in
- Try refreshing the page

## 🎓 Next Steps

1. **Experiment**: Create a sample story map
2. **Invite Team**: Share the URL with your team
3. **Plan Sprint**: Use high-priority stories for sprint planning
4. **Track Progress**: Mark stories as complete (future feature)
5. **Export**: Consider adding export to PDF/image (future feature)

---

**Happy Story Mapping! 🎉**

Your story mapping structure is now correct and production-ready!
