#!/usr/bin/env node

/**
 * Clean old collections that conflict with new schema
 */

import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://localhost/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
const apiKey = process.env.APPWRITE_API_KEY;

const DATABASE_ID = 'storymap';
const OLD_COLLECTIONS = ['activities', 'stories'];

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

if (apiKey) {
  client.setKey(apiKey);
}

const databases = new Databases(client);

async function main() {
  console.log('=== Cleaning Old Collections ===\n');

  for (const collectionId of OLD_COLLECTIONS) {
    try {
      console.log(`Deleting collection: ${collectionId}`);
      await databases.deleteCollection(DATABASE_ID, collectionId);
      console.log(`✓ Deleted: ${collectionId}`);
    } catch (error) {
      if (error.code === 404) {
        console.log(`ℹ Collection ${collectionId} doesn't exist (already deleted)`);
      } else {
        console.error(`Error deleting ${collectionId}:`, error.message);
      }
    }
  }

  console.log('\n=== Cleanup Complete ===');
  console.log('Now run: npm run setup-schema');
}

main();
