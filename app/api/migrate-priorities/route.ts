import { NextResponse } from 'next/server';
import { getLoggedInUser, createSessionClient } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE!;
const STORIES_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_STORIES!;

const priorityMapping: Record<string, 'must' | 'should' | 'could' | 'wont'> = {
  high: 'must',
  medium: 'should',
  low: 'could',
};

export async function POST() {
  try {
    // Check authentication
    const user = await getLoggedInUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { databases } = await createSessionClient();

    // Fetch all stories for this user
    const response = await databases.listDocuments(
      DATABASE_ID,
      STORIES_COLLECTION,
      [
        Query.equal('userId', user.$id),
        Query.limit(1000), // Adjust if needed
      ]
    );

    let updatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];
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

      try {
        await databases.updateDocument(
          DATABASE_ID,
          STORIES_COLLECTION,
          story.$id,
          { priority: newPriority }
        );
        updatedCount++;
      } catch (error) {
        errors.push(`Failed to update story "${story.title}": ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      results: {
        total: response.documents.length,
        updated: updatedCount,
        skipped: skippedCount,
        errors,
      },
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Migration failed',
      },
      { status: 500 }
    );
  }
}
