'use server';

import { getLoggedInUser, createSessionClient } from '@/lib/appwrite-server';
import { Query, ID } from 'node-appwrite';
import { revalidatePath } from 'next/cache';

const DATABASE_ID = 'storymap';
const COLLECTIONS = {
  RELEASES: 'releases',
  STORIES: 'stories',
};

// ==================== RELEASE ACTIONS ====================

export async function createRelease(data: {
  name: string;
  description?: string;
  journeyId: string;
  order: number;
}) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { databases } = await createSessionClient();

    const release = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.RELEASES,
      ID.unique(),
      {
        name: data.name,
        description: data.description || '',
        journeyId: data.journeyId,
        userId: user.$id,
        order: data.order,
        createdAt: new Date().toISOString(),
      }
    );

    revalidatePath('/');
    return { success: true, data: release };
  } catch (error) {
    console.error('Create release error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create release'
    };
  }
}

export async function getReleasesByJourney(journeyId: string) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated', data: [] };
    }

    const { databases } = await createSessionClient();

    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.RELEASES,
      [
        Query.equal('journeyId', journeyId),
        Query.equal('userId', user.$id),
        Query.orderAsc('order')
      ]
    );

    return { success: true, data: response.documents };
  } catch (error) {
    console.error('Get releases error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch releases',
      data: []
    };
  }
}

export async function updateRelease(releaseId: string, data: {
  name?: string;
  description?: string;
  order?: number;
}) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { databases } = await createSessionClient();

    // Verify ownership
    const release = await databases.getDocument(DATABASE_ID, COLLECTIONS.RELEASES, releaseId);
    if (release.userId !== user.$id) {
      return { success: false, error: 'Unauthorized' };
    }

    const updated = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.RELEASES,
      releaseId,
      data
    );

    revalidatePath('/');
    return { success: true, data: updated };
  } catch (error) {
    console.error('Update release error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update release'
    };
  }
}

export async function deleteRelease(releaseId: string) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { databases } = await createSessionClient();

    // Verify ownership
    const release = await databases.getDocument(DATABASE_ID, COLLECTIONS.RELEASES, releaseId);
    if (release.userId !== user.$id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Unassign all stories from this release
    const stories = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.STORIES,
      [Query.equal('releaseId', releaseId)]
    );

    for (const story of stories.documents) {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.STORIES,
        story.$id,
        { releaseId: null }
      );
    }

    // Delete the release
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.RELEASES, releaseId);

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Delete release error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete release'
    };
  }
}

export async function updateStoryRelease(storyId: string, releaseId: string | null) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { databases } = await createSessionClient();

    // Verify story ownership
    const story = await databases.getDocument(DATABASE_ID, COLLECTIONS.STORIES, storyId);
    if (story.userId !== user.$id) {
      return { success: false, error: 'Unauthorized' };
    }

    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.STORIES,
      storyId,
      { releaseId }
    );

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Update story release error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update story release'
    };
  }
}
