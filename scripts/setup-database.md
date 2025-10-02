# Appwrite Database Setup for StoryMap

## Database Created
- Database ID: `storymap`
- Database Name: `StoryMap Database`

## Collections to Create

### 1. Activities Collection
- Collection ID: `activities`
- Name: `Activities`
- Permissions: `read("any")`, `create("any")`, `update("any")`, `delete("any")`

**Attributes:**
- `name` (string, size: 100, required: true)
- `createdAt` (datetime, required: true)
- `userId` (string, size: 50, required: true)

### 2. Stories Collection
- Collection ID: `stories`
- Name: `Stories`
- Permissions: `read("any")`, `create("any")`, `update("any")`, `delete("any")`

**Attributes:**
- `activityId` (string, size: 50, required: true)
- `title` (string, size: 200, required: true)
- `description` (string, size: 1000, required: false)
- `priority` (string, size: 20, required: true) - enum values: "high", "medium", "low"
- `createdAt` (datetime, required: true)
- `userId` (string, size: 50, required: true)

**Index:**
- Key: `activityId_idx`
- Type: `key`
- Attributes: `["activityId"]`

## Manual Setup Steps (Appwrite Console)

1. Go to http://localhost/ (or your Appwrite endpoint)
2. Navigate to your project
3. Select "Databases" from the sidebar
4. The database "StoryMap Database" should already exist
5. Click on it and create the collections and attributes as specified above

## Alternative: Use Appwrite CLI

```bash
# Install Appwrite CLI if not already installed
npm install -g appwrite-cli

# Login to your Appwrite instance
appwrite login

# Create attributes for activities collection
appwrite databases createStringAttribute \
  --databaseId storymap \
  --collectionId activities \
  --key name \
  --size 100 \
  --required true

appwrite databases createDatetimeAttribute \
  --databaseId storymap \
  --collectionId activities \
  --key createdAt \
  --required true

appwrite databases createStringAttribute \
  --databaseId storymap \
  --collectionId activities \
  --key userId \
  --size 50 \
  --required true

# Create stories collection
appwrite databases createCollection \
  --databaseId storymap \
  --collectionId stories \
  --name Stories \
  --permissions 'read("any")' 'create("any")' 'update("any")' 'delete("any")'

# Create attributes for stories collection
appwrite databases createStringAttribute \
  --databaseId storymap \
  --collectionId stories \
  --key activityId \
  --size 50 \
  --required true

appwrite databases createStringAttribute \
  --databaseId storymap \
  --collectionId stories \
  --key title \
  --size 200 \
  --required true

appwrite databases createStringAttribute \
  --databaseId storymap \
  --collectionId stories \
  --key description \
  --size 1000 \
  --required false

appwrite databases createStringAttribute \
  --databaseId storymap \
  --collectionId stories \
  --key priority \
  --size 20 \
  --required true

appwrite databases createDatetimeAttribute \
  --databaseId storymap \
  --collectionId stories \
  --key createdAt \
  --required true

appwrite databases createStringAttribute \
  --databaseId storymap \
  --collectionId stories \
  --key userId \
  --size 50 \
  --required true

# Create index
appwrite databases createIndex \
  --databaseId storymap \
  --collectionId stories \
  --key activityId_idx \
  --type key \
  --attributes activityId
```
