'use server';

import { getLoggedInUser } from '@/lib/appwrite-server';

/**
 * Get currently authenticated user
 * Server action that safely retrieves user from session
 */
export async function getCurrentUser() {
  try {
    const user = await getLoggedInUser();
    return user;
  } catch (error) {
    return null;
  }
}
