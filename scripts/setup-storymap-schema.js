#!/usr/bin/env node

/**
 * StoryMap Database Schema Setup
 * 
 * Proper User Story Mapping Structure:
 * Epic -> User Journey -> Steps (horizontal axis) -> Stories (vertical axis, prioritized)
 */

import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://localhost/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
const apiKey = process.env.APPWRITE_API_KEY;

const DATABASE_ID = 'storymap';
const COLLECTIONS = {
  EPICS: 'epics',
  USER_JOURNEYS: 'user_journeys',
  STEPS: 'steps',
  STORIES: 'stories',
};

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

if (apiKey) {
  client.setKey(apiKey);
}

const databases = new Databases(client);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function createStringAttribute(collectionId, key, size, required = true, defaultValue) {
  try {
    console.log(`  Creating string attribute: ${key}`);
    await databases.createStringAttribute(
      DATABASE_ID,
      collectionId,
      key,
      size,
      required,
      defaultValue,
      false
    );
    console.log(`  ✓ Created attribute: ${key}`);
    await delay(500);
  } catch (error) {
    if (error.code === 409) {
      console.log(`  ℹ Attribute ${key} already exists`);
    } else {
      throw error;
    }
  }
}

async function createIntegerAttribute(collectionId, key, required = true, min = null, max = null) {
  try {
    console.log(`  Creating integer attribute: ${key}`);
    await databases.createIntegerAttribute(
      DATABASE_ID,
      collectionId,
      key,
      required,
      min,
      max
    );
    console.log(`  ✓ Created attribute: ${key}`);
    await delay(500);
  } catch (error) {
    if (error.code === 409) {
      console.log(`  ℹ Attribute ${key} already exists`);
    } else {
      throw error;
    }
  }
}

async function createDatetimeAttribute(collectionId, key, required = true) {
  try {
    console.log(`  Creating datetime attribute: ${key}`);
    await databases.createDatetimeAttribute(
      DATABASE_ID,
      collectionId,
      key,
      required
    );
    console.log(`  ✓ Created attribute: ${key}`);
    await delay(500);
  } catch (error) {
    if (error.code === 409) {
      console.log(`  ℹ Attribute ${key} already exists`);
    } else {
      throw error;
    }
  }
}

async function createCollection(collectionId, name) {
  try {
    console.log(`\nCreating collection: ${name}`);
    await databases.createCollection(
      DATABASE_ID,
      collectionId,
      name,
      [
        'read("any")',
        'create("any")',
        'update("any")',
        'delete("any")',
      ],
      false
    );
    console.log(`✓ Created collection: ${name}`);
    await delay(1000);
  } catch (error) {
    if (error.code === 409) {
      console.log(`ℹ Collection ${name} already exists`);
    } else {
      throw error;
    }
  }
}

async function setupEpicsCollection() {
  await createCollection(COLLECTIONS.EPICS, 'Epics');
  
  await createStringAttribute(COLLECTIONS.EPICS, 'name', 200, true);
  await createStringAttribute(COLLECTIONS.EPICS, 'description', 1000, false);
  await createStringAttribute(COLLECTIONS.EPICS, 'userId', 50, true);
  await createDatetimeAttribute(COLLECTIONS.EPICS, 'createdAt', true);
}

async function setupUserJourneysCollection() {
  await createCollection(COLLECTIONS.USER_JOURNEYS, 'User Journeys');
  
  await createStringAttribute(COLLECTIONS.USER_JOURNEYS, 'name', 200, true);
  await createStringAttribute(COLLECTIONS.USER_JOURNEYS, 'description', 1000, false);
  await createStringAttribute(COLLECTIONS.USER_JOURNEYS, 'epicId', 50, true);
  await createStringAttribute(COLLECTIONS.USER_JOURNEYS, 'userId', 50, true);
  await createIntegerAttribute(COLLECTIONS.USER_JOURNEYS, 'order', true, 0);
  await createDatetimeAttribute(COLLECTIONS.USER_JOURNEYS, 'createdAt', true);
}

async function setupStepsCollection() {
  await createCollection(COLLECTIONS.STEPS, 'Steps');
  
  await createStringAttribute(COLLECTIONS.STEPS, 'name', 200, true);
  await createStringAttribute(COLLECTIONS.STEPS, 'description', 500, false);
  await createStringAttribute(COLLECTIONS.STEPS, 'journeyId', 50, true);
  await createStringAttribute(COLLECTIONS.STEPS, 'userId', 50, true);
  await createIntegerAttribute(COLLECTIONS.STEPS, 'order', true, 0);
  await createDatetimeAttribute(COLLECTIONS.STEPS, 'createdAt', true);
}

async function setupStoriesCollection() {
  await createCollection(COLLECTIONS.STORIES, 'Stories');
  
  await createStringAttribute(COLLECTIONS.STORIES, 'title', 200, true);
  await createStringAttribute(COLLECTIONS.STORIES, 'description', 1000, false);
  await createStringAttribute(COLLECTIONS.STORIES, 'stepId', 50, true);
  await createStringAttribute(COLLECTIONS.STORIES, 'userId', 50, true);
  await createStringAttribute(COLLECTIONS.STORIES, 'priority', 20, true); // high/medium/low
  await createIntegerAttribute(COLLECTIONS.STORIES, 'order', true, 0); // For vertical ordering
  await createDatetimeAttribute(COLLECTIONS.STORIES, 'createdAt', true);
}

async function createIndexes() {
  const indexes = [
    { collection: COLLECTIONS.USER_JOURNEYS, name: 'epicId_idx', key: 'epicId' },
    { collection: COLLECTIONS.STEPS, name: 'journeyId_idx', key: 'journeyId' },
    { collection: COLLECTIONS.STORIES, name: 'stepId_idx', key: 'stepId' },
  ];

  for (const idx of indexes) {
    try {
      console.log(`\nCreating index: ${idx.name}`);
      await databases.createIndex(
        DATABASE_ID,
        idx.collection,
        idx.name,
        'key',
        [idx.key]
      );
      console.log(`✓ Created index: ${idx.name}`);
      await delay(500);
    } catch (error) {
      if (error.code === 409) {
        console.log(`ℹ Index ${idx.name} already exists`);
      } else {
        throw error;
      }
    }
  }
}

async function main() {
  console.log('=== StoryMap Schema Setup ===\n');
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Project: ${projectId}`);
  console.log(`Database: ${DATABASE_ID}\n`);

  if (!projectId) {
    console.error('❌ Error: NEXT_PUBLIC_APPWRITE_PROJECT not set in .env.local');
    process.exit(1);
  }

  if (!apiKey) {
    console.warn('⚠️  Warning: APPWRITE_API_KEY not set.');
    process.exit(1);
  }

  try {
    await databases.get(DATABASE_ID);
    console.log(`ℹ Database "${DATABASE_ID}" exists\n`);

    // Setup collections
    await setupEpicsCollection();
    await setupUserJourneysCollection();
    await setupStepsCollection();
    await setupStoriesCollection();
    await createIndexes();

    console.log('\n=== Setup Complete ===');
    console.log('✅ StoryMap schema created successfully!');
    console.log('\nStructure:');
    console.log('  Epic (e.g., "E-commerce Platform")');
    console.log('    └─ User Journey (e.g., "Customer Purchase Flow")');
    console.log('        └─ Steps [horizontal axis]');
    console.log('            ├─ Step 1: "Browse Products"');
    console.log('            ├─ Step 2: "Add to Cart"');
    console.log('            └─ Step 3: "Checkout"');
    console.log('                └─ Stories [vertical axis, prioritized]');
    console.log('                    ├─ Story 1 (Priority: High)');
    console.log('                    ├─ Story 2 (Priority: Medium)');
    console.log('                    └─ Story 3 (Priority: Low)\n');
  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    process.exit(1);
  }
}

main();
