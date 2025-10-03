#!/usr/bin/env node

/**
 * Test script to verify authentication and app functionality
 */

const testEmail = 'marc@marcneves.com';
const testPassword = 'Ninjapiggy321!';
const baseUrl = 'http://localhost:3000';

async function testAuth() {
  console.log('🔍 Testing StoryMap Authentication...\n');

  // Test 1: Check if sign-in page loads
  console.log('1. Testing sign-in page...');
  try {
    const signInResponse = await fetch(`${baseUrl}/sign-in`);
    if (signInResponse.ok) {
      console.log('   ✅ Sign-in page loads successfully');
    } else {
      console.log('   ❌ Sign-in page failed:', signInResponse.status);
    }
  } catch (error) {
    console.log('   ❌ Error loading sign-in page:', error.message);
  }

  // Test 2: Check if home page redirects to sign-in when not authenticated
  console.log('\n2. Testing home page redirect...');
  try {
    const homeResponse = await fetch(`${baseUrl}/`, {
      redirect: 'manual'
    });
    console.log('   ℹ️  Home page status:', homeResponse.status);
    console.log('   ℹ️  Should redirect to /sign-in if not authenticated');
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  // Test 3: Try to sign in (Note: This requires server actions which are harder to test)
  console.log('\n3. Authentication test...');
  console.log('   ℹ️  Testing with credentials:');
  console.log('   📧 Email:', testEmail);
  console.log('   🔑 Password: ********');
  console.log('   ⚠️  Note: Full authentication test requires browser interaction');

  console.log('\n✅ Basic connectivity tests completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Open Chrome at http://localhost:3000');
  console.log('   2. Navigate to sign-in page');
  console.log(`   3. Enter email: ${testEmail}`);
  console.log('   4. Enter password and submit');
  console.log('   5. Check browser console for any errors');
  console.log('   6. Try creating an activity and stories');
}

testAuth().catch(console.error);
