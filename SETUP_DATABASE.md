# Database Setup Guide

This guide will help you set up the Appwrite database for the StoryMap application.

## Prerequisites

- Appwrite instance running (http://localhost or your Appwrite endpoint)
- Project created in Appwrite
- Environment variables configured in `.env.local`

## Step 1: Get Your Appwrite API Key

1. **Access Appwrite Console**: Open http://localhost (or your Appwrite endpoint) in your browser

2. **Navigate to Your Project**: Select your StoryMap project (ID: `68c7fb250020438d183e`)

3. **Go to Settings**: Click on "Settings" in the left sidebar

4. **Navigate to API Keys**: Click on the "API Keys" tab

5. **Create a New API Key**:
   - Click "Create API Key"
   - Name: "Database Setup"
   - Expiration: Never (or set a specific date)
   - Scopes: Select the following permissions:
     - `databases.write` (required to create collections and attributes)
     - `databases.read` (required to verify setup)
   - Click "Create"

6. **Copy the API Key**: Copy the generated API key (it will look like a long string)

## Step 2: Configure Environment Variables

Add the API key to your `.env.local` file:

```bash
# Existing variables
NEXT_PUBLIC_APPWRITE_ENDPOINT=http://localhost/v1
NEXT_PUBLIC_APPWRITE_PROJECT=68c7fb250020438d183e

# Add this line with your API key
APPWRITE_API_KEY=your_api_key_here
```

## Step 3: Run the Setup Script

The database "StoryMap Database" has already been created with ID `storymap`. Now run the setup script to create the collections and attributes:

```bash
npm run setup-db
```

This will:
- ✅ Verify the database exists
- ✅ Create the "Activities" collection with attributes
- ✅ Create the "Stories" collection with attributes
- ✅ Create necessary indexes

## Step 4: Verify the Setup

After running the script, you should see output like:

```
=== Appwrite Database Setup ===

Endpoint: http://localhost/v1
Project: 68c7fb250020438d183e
Database: storymap

ℹ Database "storymap" already exists

Creating collection: Activities
✓ Created collection: Activities
  Creating string attribute: name
  ✓ Created attribute: name
  Creating datetime attribute: createdAt
  ✓ Created attribute: createdAt
  Creating string attribute: userId
  ✓ Created attribute: userId

Creating collection: Stories
✓ Created collection: Stories
  Creating string attribute: activityId
  ✓ Created attribute: activityId
  ...

Creating index on stories.activityId
✓ Created index: activityId_idx

=== Setup Complete ===
✅ Database schema created successfully!
```

## Step 5: Verify in Appwrite Console

1. Go to http://localhost
2. Navigate to "Databases" in the left sidebar
3. Click on "StoryMap Database"
4. You should see two collections:
   - **Activities** with attributes: name, createdAt, userId
   - **Stories** with attributes: activityId, title, description, priority, createdAt, userId

## Database Schema

### Activities Collection
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string(100) | Yes | Activity name |
| createdAt | datetime | Yes | Creation timestamp |
| userId | string(50) | Yes | Owner user ID |

### Stories Collection
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| activityId | string(50) | Yes | Parent activity ID |
| title | string(200) | Yes | Story title |
| description | string(1000) | No | Story description |
| priority | string(20) | Yes | Priority (high/medium/low) |
| createdAt | datetime | Yes | Creation timestamp |
| userId | string(50) | Yes | Owner user ID |

### Indexes
- `activityId_idx` on stories.activityId (for efficient queries)

## Troubleshooting

### Error: "APPWRITE_API_KEY not set"
- Make sure you've added the API key to `.env.local`
- The variable name must be exactly `APPWRITE_API_KEY`

### Error: "user_unauthorized" or 401
- Verify your API key has the correct permissions
- Make sure the API key has not expired
- Check that you're using the correct project ID

### Error: "Database not found"
- The database "storymap" was created but might not be accessible
- Verify in the Appwrite console that the database exists
- Check the database ID is correct

### Attributes Already Exist
- If you see "ℹ Attribute XXX already exists", this is normal
- The script is idempotent and can be run multiple times safely

## Next Steps

After setup is complete:

1. **Update Application Code**: The database service is already created in `lib/database.ts`
2. **Test CRUD Operations**: Use the app to create, read, update, and delete activities and stories
3. **Review Permissions**: For production, update permissions to use proper user-based access control

## Manual Setup (Alternative)

If you prefer to set up manually or the script fails, follow the instructions in `scripts/setup-database.md`.
