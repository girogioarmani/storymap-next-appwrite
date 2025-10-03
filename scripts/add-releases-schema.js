#!/usr/bin/env node

/**
 * Appwrite Database Migration: Add Releases
 * 
 * This script adds the releases collection and updates stories to support releases.
 * 
 * Usage:
 *   node scripts/add-releases-schema.js
 */

import { Client, Databases, ID } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Configuration
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://localhost/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
const apiKey = process.env.APPWRITE_API_KEY;

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE || 'storymap';
const RELEASES_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_RELEASES || 'releases';
const STORIES_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_STORIES || 'stories';

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
    await delay(1000); // Wait for attribute to be created
  } catch (error) {
    if (error.code === 409) {
      console.log(`  ℹ Attribute ${key} already exists`);
    } else {
      throw error;
    }
  }
}

async function createIntegerAttribute(collectionId, key, required = true, defaultValue) {
  try {
    console.log(`  Creating integer attribute: ${key}`);
    await databases.createIntegerAttribute(
      DATABASE_ID,
      collectionId,
      key,
      required,
      undefined, // min
      undefined, // max
      defaultValue,
      false // array
    );
    console.log(`  ✓ Created attribute: ${key}`);
    await delay(1000);
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
    await delay(1000);
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

async function setupReleasesCollection() {
  await createCollection(RELEASES_COLLECTION, 'Releases');
  
  await createStringAttribute(RELEASES_COLLECTION, 'name', 100, true);
  await createStringAttribute(RELEASES_COLLECTION, 'description', 500, false);
  await createStringAttribute(RELEASES_COLLECTION, 'journeyId', 50, true);
  await createStringAttribute(RELEASES_COLLECTION, 'userId', 50, true);
  await createIntegerAttribute(RELEASES_COLLECTION, 'order', true); // No default for required field
  await createDatetimeAttribute(RELEASES_COLLECTION, 'createdAt', true);
  
  console.log('✓ Releases collection setup complete');
}

async function addReleaseIdToStories() {
  console.log('\nAdding releaseId to stories collection...');
  
  // Add releaseId attribute (nullable - stories can exist without a release)
  await createStringAttribute(STORIES_COLLECTION, 'releaseId', 50, false);
  
  console.log('✓ Added releaseId to stories');
}

async function createIndexes() {
  try {
    console.log('\nCreating index on releases.journeyId');
    await databases.createIndex(
      DATABASE_ID,
      RELEASES_COLLECTION,
      'journeyId_idx',
      'key',
      ['journeyId']
    );
    console.log('✓ Created index: journeyId_idx');
  } catch (error) {
    if (error.code === 409) {
      console.log('ℹ Index journeyId_idx already exists');
    } else {
      throw error;
    }
  }
  
  try {
    console.log('\nCreating index on stories.releaseId');
    await databases.createIndex(
      DATABASE_ID,
      STORIES_COLLECTION,
      'releaseId_idx',
      'key',
      ['releaseId']
    );
    console.log('✓ Created index: releaseId_idx');
  } catch (error) {
    if (error.code === 409) {
      console.log('ℹ Index releaseId_idx already exists');
    } else {
      throw error;
    }
  }
}

async function main() {
  console.log('=== Appwrite Releases Migration ===\n');
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Project: ${projectId}`);
  console.log(`Database: ${DATABASE_ID}\n`);

  if (!projectId) {
    console.error('❌ Error: NEXT_PUBLIC_APPWRITE_PROJECT not set in .env.local');
    process.exit(1);
  }

  if (!apiKey) {
    console.error('❌ Error: APPWRITE_API_KEY not set');
    console.error('   Please set APPWRITE_API_KEY in your environment or .env.local file.\n');
    process.exit(1);
  }

  try {
    // Check if database exists
    try {
      await databases.get(DATABASE_ID);
      console.log(`ℹ Database "${DATABASE_ID}" found\n`);
    } catch (error) {
      if (error.code === 404) {
        console.log(`❌ Database "${DATABASE_ID}" not found.`);
        console.log('   Please create it first using the main setup script.');
        process.exit(1);
      }
      throw error;
    }

    // Run migration
    await setupReleasesCollection();
    await addReleaseIdToStories();
    await createIndexes();

    console.log('\n=== Migration Complete ===');
    console.log('✅ Releases feature added successfully!');
    console.log('\nWhat was added:');
    console.log('  • releases collection with name, description, order');
    console.log('  • releaseId field in stories collection');
    console.log('  • Indexes for better query performance');
    console.log('\nNext steps:');
    console.log('  1. Update .env.local with NEXT_PUBLIC_APPWRITE_COLLECTION_RELEASES');
    console.log('  2. Restart your application');
    console.log('  3. Test the releases feature\n');
  } catch (error) {
    console.error('\n❌ Error during migration:', error.message);
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
