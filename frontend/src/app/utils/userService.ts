/**
 * User API Service
 * Handles user-related operations
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

export interface UserData {
  id: number;
  email: string;
  name?: string;
  phone_number?: string;
  preferred_currency?: string;
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

/**
 * Get current authenticated user profile
 */
export async function getUserProfile(token: string): Promise<{
  success: boolean;
  user?: UserData;
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Failed to fetch profile: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      user: data.user || data,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: errorMsg || 'Failed to fetch profile',
    };
  }
}

/**
 * Update user profile (phone number and preferred currency)
 */
export async function updateUserProfile(
  token: string,
  data: {
    phone_number?: string;
    preferred_currency?: string;
  }
): Promise<{
  success: boolean;
  user?: UserData;
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Failed to update profile',
      };
    }

    const result = await response.json();
    return {
      success: true,
      user: result.user || result,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: errorMsg || 'Failed to update profile',
    };
  }
}

/**
 * Get user's bookings
 */
export async function getUserBookings(token: string): Promise<{
  success: boolean;
  bookings?: any[];
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/bookings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Failed to fetch bookings: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      bookings: data.bookings || [],
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: errorMsg || 'Failed to fetch bookings',
    };
  }
}

/**
 * Get all users (admin endpoint)
 */
export async function getAllUsers(token?: string): Promise<{
  success: boolean;
  users?: any[];
  error?: string;
}> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/users/all`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('getAllUsers: Failed with status', response.status, errorText);
      return {
        success: false,
        error: `Failed to fetch users: ${response.statusText}`,
      };
    }

    const data = await response.json();
    console.log('getAllUsers: Retrieved users', data);
    return {
      success: true,
      users: data.users || [],
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('getAllUsers: Error', errorMsg);
    return {
      success: false,
      error: errorMsg || 'Failed to fetch users',
    };
  }
}
