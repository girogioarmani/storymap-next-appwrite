#!/usr/bin/env node

/**
 * Appwrite Database Setup Script
 * 
 * This script automatically creates the database schema for the StoryMap application.
 * It creates the collections and attributes needed for activities and stories.
 * 
 * Prerequisites:
 * - Appwrite instance running
 * - Project created in Appwrite
 * - Environment variables set in .env.local
 * 
 * Usage:
 *   node scripts/setup-appwrite.js
 * 
 * Or with API key:
 *   APPWRITE_API_KEY=your_api_key node scripts/setup-appwrite.js
 */

const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

// Configuration
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://localhost/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
const apiKey = process.env.APPWRITE_API_KEY;

const DATABASE_ID = 'storymap';
const COLLECTIONS = {
  ACTIVITIES: 'activities',
  STORIES: 'stories',
};

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

if (apiKey) {
  client.setKey(apiKey);
}

const databases = new Databases(client);

// Helper functions
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
      false // array
    );
    console.log(`  ✓ Created attribute: ${key}`);
    await delay(500); // Wait for attribute to be created
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
      false // documentSecurity
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

async function setupActivitiesCollection() {
  await createCollection(COLLECTIONS.ACTIVITIES, 'Activities');
  
  await createStringAttribute(COLLECTIONS.ACTIVITIES, 'name', 100, true);
  await createDatetimeAttribute(COLLECTIONS.ACTIVITIES, 'createdAt', true);
  await createStringAttribute(COLLECTIONS.ACTIVITIES, 'userId', 50, true);
}

async function setupStoriesCollection() {
  await createCollection(COLLECTIONS.STORIES, 'Stories');
  
  await createStringAttribute(COLLECTIONS.STORIES, 'activityId', 50, true);
  await createStringAttribute(COLLECTIONS.STORIES, 'title', 200, true);
  await createStringAttribute(COLLECTIONS.STORIES, 'description', 1000, false);
  await createStringAttribute(COLLECTIONS.STORIES, 'priority', 20, true);
  await createDatetimeAttribute(COLLECTIONS.STORIES, 'createdAt', true);
  await createStringAttribute(COLLECTIONS.STORIES, 'userId', 50, true);
}

async function createIndex() {
  try {
    console.log('\nCreating index on stories.activityId');
    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.STORIES,
      'activityId_idx',
      'key',
      ['activityId']
    );
    console.log('✓ Created index: activityId_idx');
  } catch (error) {
    if (error.code === 409) {
      console.log('ℹ Index activityId_idx already exists');
    } else {
      throw error;
    }
  }
}

async function main() {
  console.log('=== Appwrite Database Setup ===\n');
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Project: ${projectId}`);
  console.log(`Database: ${DATABASE_ID}\n`);

  if (!projectId) {
    console.error('❌ Error: NEXT_PUBLIC_APPWRITE_PROJECT not set in .env.local');
    process.exit(1);
  }

  if (!apiKey) {
    console.warn('⚠️  Warning: APPWRITE_API_KEY not set. You may need to create collections manually.');
    console.warn('   Please set APPWRITE_API_KEY in your environment or .env.local file.\n');
  }

  try {
    // Check if database exists
    try {
      await databases.get(DATABASE_ID);
      console.log(`ℹ Database "${DATABASE_ID}" already exists\n`);
    } catch (error) {
      if (error.code === 404) {
        console.log(`❌ Database "${DATABASE_ID}" not found.`);
        console.log('   Please create it manually in the Appwrite console or using the API.');
        process.exit(1);
      }
      throw error;
    }

    // Setup collections
    await setupActivitiesCollection();
    await setupStoriesCollection();
    await createIndex();

    console.log('\n=== Setup Complete ===');
    console.log('✅ Database schema created successfully!');
    console.log('\nNext steps:');
    console.log('1. Update your application to use the database service');
    console.log('2. Test the CRUD operations in your app');
    console.log('3. Configure proper permissions for production\n');
  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    if (error.code === 401) {
      console.error('\nAuthentication error. Make sure:');
      console.error('1. Your Appwrite instance is running');
      console.error('2. APPWRITE_API_KEY is set and valid');
      console.error('3. The API key has necessary permissions');
    }
    process.exit(1);
  }
}

main();
