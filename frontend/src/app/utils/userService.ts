/**
 * User API Service
 * Handles user-related operations
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface UserData {
  id: number;
  email: string;
  name?: string;
  role?: string;
  created_at?: string;
}

/**
 * Get user by email - retrieves existing user from database
 */
export async function getUserByEmail(email: string): Promise<{
  success: boolean;
  user?: UserData;
  error?: string;
}> {
  try {
    if (!email) {
      return {
        success: false,
        error: 'Email is required',
      };
    }

    console.log('getUserByEmail: Fetching user for', email);

    const response = await fetch(`${API_BASE_URL}/users/by-email/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('getUserByEmail: Response status', response.status);

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: 'User not found',
        };
      }
      const errorText = await response.text();
      console.error('getUserByEmail: Failed with status', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    console.log('getUserByEmail: Success', data);
    return {
      success: true,
      user: data.user || data,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('getUserByEmail: Error', errorMsg);
    return {
      success: false,
      error: errorMsg || 'Failed to fetch user',
    };
  }
}
