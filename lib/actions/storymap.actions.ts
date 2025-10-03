'use server';

import { createSessionClient, getLoggedInUser } from '@/lib/appwrite-server';
import { ID, Query } from 'node-appwrite';
import { revalidatePath } from 'next/cache';

const DATABASE_ID = 'storymap';
const COLLECTIONS = {
  EPICS: 'epics',
  USER_JOURNEYS: 'user_journeys',
  STEPS: 'steps',
  STORIES: 'stories',
};

// ==================== EPIC ACTIONS ====================

export async function createEpic(data: { name: string; description?: string }) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { databases } = await createSessionClient();
    
    const epic = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.EPICS,
      ID.unique(),
      {
        name: data.name,
        description: data.description || '',
        userId: user.$id,
        createdAt: new Date().toISOString(),
      }
    );

    revalidatePath('/');
    return { success: true, data: epic };
  } catch (error) {
    console.error('Create epic error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create epic' 
    };
  }
}

export async function getEpic(epicId: string) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { databases } = await createSessionClient();
    
    const epic = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.EPICS,
      epicId
    );

    if (epic.userId !== user.$id) {
      return { success: false, error: 'Unauthorized' };
    }

    return { success: true, data: epic };
  } catch (error) {
    console.error('Get epic error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch epic' 
    };
  }
}

export async function getAllEpics() {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated', data: [] };
    }

    const { databases } = await createSessionClient();
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.EPICS,
      [Query.equal('userId', user.$id), Query.orderDesc('createdAt')]
    );

    return { success: true, data: response.documents };
  } catch (error) {
    console.error('Get all epics error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch epics',
      data: []
    };
  }
}

export async function deleteEpic(epicId: string) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { databases } = await createSessionClient();
    
    // Verify ownership
    const epic = await databases.getDocument(DATABASE_ID, COLLECTIONS.EPICS, epicId);
    if (epic.userId !== user.$id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Delete all user journeys and their descendants
    const journeys = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USER_JOURNEYS,
      [Query.equal('epicId', epicId)]
    );

    for (const journey of journeys.documents) {
      await deleteUserJourney(journey.$id);
    }

    // Delete the epic
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.EPICS, epicId);

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Delete epic error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete epic' 
    };
  }
}

// ==================== USER JOURNEY ACTIONS ====================

export async function createUserJourney(data: { 
  name: string; 
  description?: string; 
  epicId: string;
  order: number;
}) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { databases } = await createSessionClient();
    
    const journey = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.USER_JOURNEYS,
      ID.unique(),
      {
        name: data.name,
        description: data.description || '',
        epicId: data.epicId,
        userId: user.$id,
        order: data.order,
        createdAt: new Date().toISOString(),
      }
    );

    revalidatePath('/');
    return { success: true, data: journey };
  } catch (error) {
    console.error('Create user journey error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create user journey' 
    };
  }
}

export async function getJourneysByEpic(epicId: string) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated', data: [] };
    }

    const { databases } = await createSessionClient();
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USER_JOURNEYS,
      [
        Query.equal('epicId', epicId),
        Query.equal('userId', user.$id),
        Query.orderAsc('order')
      ]
    );

    return { success: true, data: response.documents };
  } catch (error) {
    console.error('Get journeys by epic error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch journeys',
      data: []
    };
  }
}

export async function deleteUserJourney(journeyId: string) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { databases } = await createSessionClient();
    
    // Delete all steps and their stories
    const steps = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.STEPS,
      [Query.equal('journeyId', journeyId)]
    );

    for (const step of steps.documents) {
      await deleteStep(step.$id);
    }

    // Delete the journey
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.USER_JOURNEYS, journeyId);

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Delete user journey error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete user journey' 
    };
  }
}

// ==================== STEP ACTIONS ====================

export async function createStep(data: { 
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
    
    const step = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.STEPS,
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
    return { success: true, data: step };
  } catch (error) {
    console.error('Create step error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create step' 
    };
  }
}

export async function getStepsByJourney(journeyId: string) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated', data: [] };
    }

    const { databases } = await createSessionClient();
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.STEPS,
      [
        Query.equal('journeyId', journeyId),
        Query.equal('userId', user.$id),
        Query.orderAsc('order')
      ]
    );

    return { success: true, data: response.documents };
  } catch (error) {
    console.error('Get steps by journey error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch steps',
      data: []
    };
  }
}

export async function updateStepOrder(stepId: string, newOrder: number) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { databases } = await createSessionClient();
    
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.STEPS,
      stepId,
      { order: newOrder }
    );

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Update step order error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update step order' 
    };
  }
}

export async function deleteStep(stepId: string) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { databases } = await createSessionClient();
    
    // Delete all stories in this step
    const stories = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.STORIES,
      [Query.equal('stepId', stepId)]
    );

    for (const story of stories.documents) {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.STORIES, story.$id);
    }

    // Delete the step
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.STEPS, stepId);

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Delete step error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete step' 
    };
  }
}

// ==================== STORY ACTIONS ====================

export async function createStory(data: { 
  title: string; 
  description?: string; 
  stepId: string;
  priority: 'must' | 'should' | 'could' | 'wont';
  order: number;
}) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { databases } = await createSessionClient();
    
    console.log('🔧 SERVER: Creating story with data:', {
      title: data.title,
      description: data.description,
      stepId: data.stepId,
      priority: data.priority,
      order: data.order
    });
    
    const story = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.STORIES,
      ID.unique(),
      {
        title: data.title,
        description: data.description || '',
        stepId: data.stepId,
        userId: user.$id,
        priority: data.priority,
        order: data.order,
        createdAt: new Date().toISOString(),
      }
    );

    console.log('🔧 SERVER: Story created in DB:', {
      id: story.$id,
      title: story.title,
      description: story.description
    });

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

export async function getStoriesByStep(stepId: string) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated', data: [] };
    }

    const { databases } = await createSessionClient();
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.STORIES,
      [
        Query.equal('stepId', stepId),
        Query.equal('userId', user.$id),
        Query.orderAsc('order')
      ]
    );

    return { success: true, data: response.documents };
  } catch (error) {
    console.error('Get stories by step error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch stories',
      data: []
    };
  }
}

export async function updateStory(storyId: string, data: {
  title?: string;
  description?: string;
  priority?: 'must' | 'should' | 'could' | 'wont';
}) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { databases } = await createSessionClient();
    
    // Verify ownership
    const story = await databases.getDocument(DATABASE_ID, COLLECTIONS.STORIES, storyId);
    if (story.userId !== user.$id) {
      return { success: false, error: 'Unauthorized' };
    }

    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.STORIES,
      storyId,
      data
    );

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Update story error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update story' 
    };
  }
}

export async function updateStoryOrder(storyId: string, newOrder: number, newPriority?: string) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { databases } = await createSessionClient();
    
    const updateData: { order: number; priority?: string } = { order: newOrder };
    if (newPriority) {
      updateData.priority = newPriority;
    }

    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.STORIES,
      storyId,
      updateData
    );

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Update story order error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update story order' 
    };
  }
}

export async function updateStoryPlacement(storyId: string, data: {
  stepId?: string;
  releaseId?: string | null;
  order?: number;
  priority?: 'must' | 'should' | 'could' | 'wont';
}) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { databases } = await createSessionClient();
    
    // Verify ownership
    const story = await databases.getDocument(DATABASE_ID, COLLECTIONS.STORIES, storyId);
    if (story.userId !== user.$id) {
      return { success: false, error: 'Unauthorized' };
    }

    const updateData: any = {};
    if (data.stepId !== undefined) updateData.stepId = data.stepId;
    if (data.releaseId !== undefined) updateData.releaseId = data.releaseId;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.priority !== undefined) updateData.priority = data.priority;

    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.STORIES,
      storyId,
      updateData
    );

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Update story placement error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update story placement' 
    };
  }
}

export async function deleteStory(storyId: string) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { databases } = await createSessionClient();
    
    const story = await databases.getDocument(DATABASE_ID, COLLECTIONS.STORIES, storyId);
    if (story.userId !== user.$id) {
      return { success: false, error: 'Unauthorized' };
    }

    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.STORIES, storyId);

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

// ==================== COMPLETE DATA FETCH ====================

export async function getCompleteStoryMap(epicId: string): Promise<{
  success: boolean;
  error?: string;
  data: any;
}> {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return { success: false, error: 'Not authenticated', data: null };
    }

    const { databases } = await createSessionClient();
    
    // Get epic
    const epic = await databases.getDocument(DATABASE_ID, COLLECTIONS.EPICS, epicId);
    
    if (epic.userId !== user.$id) {
      return { success: false, error: 'Unauthorized', data: null };
    }

    // Get journeys for this epic
    const journeys = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USER_JOURNEYS,
      [Query.equal('epicId', epicId), Query.orderAsc('order')]
    );

    // For each journey, get steps with their stories
    const journeysWithSteps = await Promise.all(
      journeys.documents.map(async (journey) => {
        const steps = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.STEPS,
          [Query.equal('journeyId', journey.$id), Query.orderAsc('order')]
        );

        const stepsWithStories = await Promise.all(
          steps.documents.map(async (step) => {
            const stories = await databases.listDocuments(
              DATABASE_ID,
              COLLECTIONS.STORIES,
              [Query.equal('stepId', step.$id), Query.orderAsc('order')]
            );

            // Filter out SPIDR breakdown stories (they only show in breakdown modal)
            const mainStories = stories.documents.filter(story => 
              !story.description?.includes('[SPIDR:')
            );

            return {
              ...step,
              stories: mainStories,
            };
          })
        );

        return {
          ...journey,
          steps: stepsWithStories,
        };
      })
    );

    return {
      success: true,
      data: {
        epic,
        journeys: journeysWithSteps,
      },
    };
  } catch (error) {
    console.error('Get complete story map error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch story map',
      data: null
    };
  }
}
