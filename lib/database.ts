import { databases } from './appwrite';
import { ID, Query } from 'appwrite';

const DATABASE_ID = 'storymap';
const ACTIVITIES_COLLECTION_ID = 'activities';
const STORIES_COLLECTION_ID = 'stories';

// Types
export interface Activity {
  $id: string;
  name: string;
  createdAt: string;
  userId: string;
}

export interface Story {
  $id: string;
  activityId: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  userId: string;
}

// Activities CRUD
export const activitiesService = {
  // Create a new activity
  async create(userId: string, name: string): Promise<Activity> {
    return await databases.createDocument(
      DATABASE_ID,
      ACTIVITIES_COLLECTION_ID,
      ID.unique(),
      {
        name,
        userId,
        createdAt: new Date().toISOString(),
      }
    );
  },

  // Get all activities for a user
  async getAll(userId: string): Promise<Activity[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      ACTIVITIES_COLLECTION_ID,
      [Query.equal('userId', userId), Query.orderDesc('createdAt')]
    );
    return response.documents as Activity[];
  },

  // Get a single activity
  async getById(activityId: string): Promise<Activity> {
    return await databases.getDocument(
      DATABASE_ID,
      ACTIVITIES_COLLECTION_ID,
      activityId
    ) as Activity;
  },

  // Update an activity
  async update(activityId: string, name: string): Promise<Activity> {
    return await databases.updateDocument(
      DATABASE_ID,
      ACTIVITIES_COLLECTION_ID,
      activityId,
      { name }
    );
  },

  // Delete an activity
  async delete(activityId: string): Promise<void> {
    await databases.deleteDocument(
      DATABASE_ID,
      ACTIVITIES_COLLECTION_ID,
      activityId
    );
  },
};

// Stories CRUD
export const storiesService = {
  // Create a new story
  async create(
    userId: string,
    activityId: string,
    title: string,
    description: string,
    priority: 'high' | 'medium' | 'low'
  ): Promise<Story> {
    return await databases.createDocument(
      DATABASE_ID,
      STORIES_COLLECTION_ID,
      ID.unique(),
      {
        activityId,
        title,
        description,
        priority,
        userId,
        createdAt: new Date().toISOString(),
      }
    );
  },

  // Get all stories for an activity
  async getByActivity(activityId: string): Promise<Story[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      STORIES_COLLECTION_ID,
      [Query.equal('activityId', activityId), Query.orderDesc('createdAt')]
    );
    return response.documents as Story[];
  },

  // Get all stories for a user
  async getAll(userId: string): Promise<Story[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      STORIES_COLLECTION_ID,
      [Query.equal('userId', userId), Query.orderDesc('createdAt')]
    );
    return response.documents as Story[];
  },

  // Get a single story
  async getById(storyId: string): Promise<Story> {
    return await databases.getDocument(
      DATABASE_ID,
      STORIES_COLLECTION_ID,
      storyId
    ) as Story;
  },

  // Update a story
  async update(
    storyId: string,
    updates: {
      title?: string;
      description?: string;
      priority?: 'high' | 'medium' | 'low';
    }
  ): Promise<Story> {
    return await databases.updateDocument(
      DATABASE_ID,
      STORIES_COLLECTION_ID,
      storyId,
      updates
    );
  },

  // Delete a story
  async delete(storyId: string): Promise<void> {
    await databases.deleteDocument(
      DATABASE_ID,
      STORIES_COLLECTION_ID,
      storyId
    );
  },

  // Delete all stories for an activity
  async deleteByActivity(activityId: string): Promise<void> {
    const stories = await this.getByActivity(activityId);
    await Promise.all(stories.map(story => this.delete(story.$id)));
  },
};
