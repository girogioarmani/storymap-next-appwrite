/**
 * Migration Script: Update Old Priority Values to MoSCoW
 * 
 * This script migrates stories from the old priority system (high/medium/low)
 * to the new MoSCoW prioritization system (must/should/could/wont).
 * 
 * Mapping:
 * - high → must
 * - medium → should
 * - low → could
 * - (any other value) → should
 */

import { Client, Databases, Query } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://localhost:80/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '');

// Note: This script requires a valid session. Run it after signing in to the application.

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE || '';
const STORIES_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_STORIES || '';

const priorityMapping: Record<string, 'must' | 'should' | 'could' | 'wont'> = {
  high: 'must',
  medium: 'should',
  low: 'could',
};

async function migrateStoryPriorities() {
  console.log('🚀 Starting priority migration...\n');

  try {
    // Fetch all stories
    console.log('📥 Fetching all stories...');
    const response = await databases.listDocuments(DATABASE_ID, STORIES_COLLECTION, [
      Query.limit(1000), // Adjust if you have more than 1000 stories
    ]);

    console.log(`✓ Found ${response.documents.length} stories\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    const validPriorities = ['must', 'should', 'could', 'wont'];

    for (const story of response.documents) {
      const currentPriority = story.priority as string;

      // Skip if already using MoSCoW
      if (validPriorities.includes(currentPriority)) {
        skippedCount++;
        continue;
      }

      // Map old priority to new
      const newPriority = priorityMapping[currentPriority] || 'should';

      console.log(`🔄 Updating story "${story.title}"`);
      console.log(`   Old priority: "${currentPriority}" → New priority: "${newPriority}"`);

      try {
        await databases.updateDocument(
          DATABASE_ID,
          STORIES_COLLECTION,
          story.$id,
          { priority: newPriority }
        );
        updatedCount++;
        console.log(`   ✓ Updated successfully\n`);
      } catch (error) {
        console.error(`   ✗ Failed to update: ${error}\n`);
      }
    }

    console.log('\n✅ Migration complete!');
    console.log(`   Updated: ${updatedCount} stories`);
    console.log(`   Skipped (already valid): ${skippedCount} stories`);
    console.log(`   Total: ${response.documents.length} stories`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateStoryPriorities()
  .then(() => {
    console.log('\n✨ Migration script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });
