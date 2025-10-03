import { Models } from 'appwrite';

export interface Epic extends Models.Document {
  name: string;
  description: string;
  userId: string;
  createdAt: string;
}

export interface UserJourney extends Models.Document {
  name: string;
  description: string;
  epicId: string;
  userId: string;
  order: number;
  createdAt: string;
}

export interface Step extends Models.Document {
  name: string;
  description: string;
  journeyId: string;
  userId: string;
  order: number;
  createdAt: string;
}

export interface Story extends Models.Document {
  title: string;
  description: string;
  stepId: string;
  userId: string;
  priority: 'must' | 'should' | 'could' | 'wont';
  order: number;
  releaseId?: string;
  createdAt: string;
}

export interface Release extends Models.Document {
  name: string;
  description: string;
  journeyId: string;
  userId: string;
  order: number;
  createdAt: string;
}

export interface StepWithStories extends Step {
  stories: Story[];
}

export interface JourneyWithSteps extends UserJourney {
  steps: StepWithStories[];
}

export interface CompleteStoryMap {
  epic: Epic;
  journeys: JourneyWithSteps[];
}
