/**
 * Auth API Service Functions
 * Handles user authentication and role management
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL = `${BASE_URL}/api`;


/**
 * Check if user is admin by email
 * Called after Firebase authentication to determine user role
 * @param email - User's email address
 * @returns Promise with isAdmin boolean
 */
export async function checkUserRole(email: string): Promise<boolean> {
  try {
    if (!email) {
      console.warn('checkUserRole: email is empty');
      return false;
    }

    console.log('checkUserRole: Checking admin status for', email);
    const response = await fetch(`${API_BASE_URL}/auth/check-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      console.error('checkUserRole: Failed with status', response.status, response.statusText);
      return false;
    }

    const data = await response.json();
    console.log('checkUserRole: Result', data);
    return data.isAdmin || false;
  } catch (error) {
    console.error('checkUserRole: Error', error);
    return false;
  }
}

/**
 * Save user profile to database
 * Called during signup to store user name & email in database
 * @param name - User's full name
 * @param email - User's email address
 * @param firebaseUid - Firebase unique identifier
 * @returns Promise with user data or error
 */
export async function saveUserProfile(
  name: string,
  email: string,
  firebaseUid: string
): Promise<{
  success: boolean;
  user?: { id: number; email: string; name: string; role: string };
  error?: string;
}> {
  try {
    if (!name || !email || !firebaseUid) {
      console.error('saveUserProfile: Missing required fields', { name, email, firebaseUid });
      return {
        success: false,
        error: 'Missing required fields: name, email, or firebaseUid',
      };
    }

    console.log('saveUserProfile: Saving user', { name, email, firebaseUid });

    const response = await fetch(`${API_BASE_URL}/auth/firebase-signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        firebaseUid,
      }),
    });

    console.log('saveUserProfile: Response status', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('saveUserProfile: Failed with status', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    console.log('saveUserProfile: Success', data);
    return data;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('saveUserProfile: Error', errorMsg);
    return {
      success: false,
      error: errorMsg || 'Failed to save user profile',
    };
  }
}
