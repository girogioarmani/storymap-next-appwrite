'use server';

import { createAdminClient } from '@/lib/appwrite-server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ID } from 'node-appwrite';

/**
 * Sign up a new user
 * Creates user account and establishes secure session
 */
export async function signUp(formData: {
  email: string;
  password: string;
  name: string;
}) {
  try {
    const { account } = await createAdminClient();

    // Create user account
    await account.create(
      ID.unique(),
      formData.email,
      formData.password,
      formData.name
    );

    // Create session
    const session = await account.createEmailPasswordSession(
      formData.email,
      formData.password
    );

    // Store session in secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('appwrite-session', session.secret, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return { success: true };
  } catch (error: any) {
    console.error('Sign up error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create account' 
    };
  }
}

/**
 * Sign in existing user
 * Validates credentials and establishes secure session
 */
export async function signIn(formData: {
  email: string;
  password: string;
}) {
  try {
    const { account } = await createAdminClient();

    // Create session with email and password
    const session = await account.createEmailPasswordSession(
      formData.email,
      formData.password
    );

    // Store session in secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('appwrite-session', session.secret, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return { success: true };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { 
      success: false, 
      error: error.message || 'Invalid email or password' 
    };
  }
}

/**
 * Sign out current user
 * Deletes session and clears cookie
 */
export async function signOut() {
  try {
    const { account } = await createAdminClient();
    const cookieStore = await cookies();
    const session = cookieStore.get('appwrite-session');

    if (session) {
      // Delete the session in Appwrite
      await account.deleteSession(session.value);
      
      // Clear the cookie
      cookieStore.delete('appwrite-session');
    }

    return { success: true };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to sign out' 
    };
  } finally {
    redirect('/sign-in');
  }
}

/**
 * Get current user session
 * Returns user data if authenticated, null otherwise
 */
export async function getCurrentUser() {
  try {
    const { account } = await createAdminClient();
    const cookieStore = await cookies();
    const session = cookieStore.get('appwrite-session');

    if (!session) {
      return null;
    }

    const user = await account.get();
    return user;
  } catch (error) {
    return null;
  }
}
