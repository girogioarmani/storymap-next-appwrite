'use server';

import { createSessionClient, getLoggedInUser } from '@/lib/appwrite-server';
import { ID, Query } from 'node-appwrite';
import { revalidatePath } from 'next/cache';

const DATABASE_ID = 'storymap';
const ACTIVITIES_COLLECTION_ID = 'activities';
const STORIES_COLLECTION_ID = 'stories';

// ===== ACTIVITIES =====

/**
 * Create a new activity
 * Validates user session before creating
 */
export async function createActivity(name: string) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { databases } = await createSessionClient();
    
    const activity = await databases.createDocument(
      DATABASE_ID,
      ACTIVITIES_COLLECTION_ID,
      ID.unique(),
      {
        name,
        userId: user.$id,
        createdAt: new Date().toISOString(),
      }
    );

    revalidatePath('/');
    return { success: true, data: activity };
  } catch (error) {
    console.error('Create activity error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create activity' 
    };
  }
}

/**
 * Get all activities for current user
 */
export async function getActivities() {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { databases } = await createSessionClient();
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      ACTIVITIES_COLLECTION_ID,
      [Query.equal('userId', user.$id), Query.orderDesc('createdAt')]
    );

    return { success: true, data: response.documents };
  } catch (error) {
    console.error('Get activities error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch activities' 
    };
  }
}

/**
 * Delete an activity
 * Validates user owns the activity before deleting
 */
export async function deleteActivity(activityId: string) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { databases } = await createSessionClient();
    
    // Verify user owns this activity
    const activity = await databases.getDocument(
      DATABASE_ID,
      ACTIVITIES_COLLECTION_ID,
      activityId
    );

    if (activity.userId !== user.$id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Delete all stories for this activity first
    await deleteStoriesByActivity(activityId);

    // Delete the activity
    await databases.deleteDocument(
      DATABASE_ID,
      ACTIVITIES_COLLECTION_ID,
      activityId
    );

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Delete activity error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete activity' 
    };
  }
}

// ===== STORIES =====

/**
 * Create a new story
 * Validates user session and activity ownership
 */
export async function createStory(
  activityId: string,
  title: string,
  description: string,
  priority: 'high' | 'medium' | 'low'
) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { databases } = await createSessionClient();
    
    // Verify user owns the activity
    const activity = await databases.getDocument(
      DATABASE_ID,
      ACTIVITIES_COLLECTION_ID,
      activityId
    );

    if (activity.userId !== user.$id) {
      return { success: false, error: 'Unauthorized' };
    }

    const story = await databases.createDocument(
      DATABASE_ID,
      STORIES_COLLECTION_ID,
      ID.unique(),
      {
        activityId,
        title,
        description,
        priority,
        userId: user.$id,
        createdAt: new Date().toISOString(),
      }
    );

    revalidatePath('/');
    return { success: true, data: story };
  } catch (error) {
    console.error('Create story error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create story' 
    };
  }
}

/**
 * Get all stories for an activity
 * Validates user owns the activity
 */
export async function getStoriesByActivity(activityId: string) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { databases } = await createSessionClient();
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      STORIES_COLLECTION_ID,
      [
        Query.equal('activityId', activityId),
        Query.equal('userId', user.$id),
        Query.orderDesc('createdAt')
      ]
    );

    return { success: true, data: response.documents };
  } catch (error) {
    console.error('Get stories error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch stories' 
    };
  }
}

/**
 * Delete a story
 * Validates user owns the story
 */
export async function deleteStory(storyId: string) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { databases } = await createSessionClient();
    
    // Verify user owns this story
    const story = await databases.getDocument(
      DATABASE_ID,
      STORIES_COLLECTION_ID,
      storyId
    );

    if (story.userId !== user.$id) {
      return { success: false, error: 'Unauthorized' };
    }

    await databases.deleteDocument(
      DATABASE_ID,
      STORIES_COLLECTION_ID,
      storyId
    );

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Delete story error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete story' 
    };
  }
}

/**
 * Delete all stories for an activity (internal helper)
 */
async function deleteStoriesByActivity(activityId: string) {
  try {
    const user = await getLoggedInUser();
    if (!user) return;

    const { databases } = await createSessionClient();
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      STORIES_COLLECTION_ID,
      [Query.equal('activityId', activityId), Query.equal('userId', user.$id)]
    );

    await Promise.all(
      response.documents.map(story =>
        databases.deleteDocument(DATABASE_ID, STORIES_COLLECTION_ID, story.$id)
      )
    );
  } catch (error) {
    console.error('Delete stories by activity error:', error);
  }
}

/**
 * Get all data for the current user (activities with their stories)
 */
export async function getAllUserData() {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated', data: null };
    }

    const { databases } = await createSessionClient();
    
    // Get all activities
    const activitiesResponse = await databases.listDocuments(
      DATABASE_ID,
      ACTIVITIES_COLLECTION_ID,
      [Query.equal('userId', user.$id), Query.orderDesc('createdAt')]
    );

    // Get all stories for the user
    const storiesResponse = await databases.listDocuments(
      DATABASE_ID,
      STORIES_COLLECTION_ID,
      [Query.equal('userId', user.$id), Query.orderDesc('createdAt')]
    );

    // Group stories by activity
    const activitiesWithStories = activitiesResponse.documents.map(activity => ({
      ...activity,
      stories: storiesResponse.documents.filter(
        story => story.activityId === activity.$id
      ),
    }));

    return { 
      success: true, 
      data: {
        activities: activitiesWithStories,
      user
      }
    };
  } catch (error) {
    console.error('Get all user data error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch data',
      data: null
    };
  }
}
