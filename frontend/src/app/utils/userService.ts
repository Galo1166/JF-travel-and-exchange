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

/**
 * Create a flight booking
 */
export async function createFlightBooking(bookingData: {
  user_id: number;
  user_email: string;
  passenger_name: string;
  email: string;
  phone_number: string;
  flight_from: string;
  flight_to: string;
  departure_date: string;
  airline: string;
  number_of_passengers: number;
  total_price: number;
  currency: string;
  flight_class: string;
  status: string;
  payment_method?: string;
}, token: string): Promise<{
  success: boolean;
  booking?: any;
  error?: string;
}> {
  try {
    // Get today's date for booking_date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Parse departure_date to ensure YYYY-MM-DD format
    let travelDate = bookingData.departure_date;
    try {
      if (travelDate) {
        // If it already matches YYYY-MM-DD format, use it as is
        if (travelDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Already in correct format
        } else if (travelDate.includes('T')) {
          // ISO datetime format (2024-03-15T10:30:00), extract just date
          travelDate = travelDate.split('T')[0];
        } else {
          // Try parsing as date and convert to YYYY-MM-DD
          const dateObj = new Date(travelDate);
          if (isNaN(dateObj.getTime())) {
            console.warn('Invalid date format:', travelDate, 'using today instead');
            travelDate = today;
          } else {
            travelDate = dateObj.toISOString().split('T')[0];
          }
        }
      }
    } catch (dateError) {
      console.warn('Date parsing error:', dateError, 'using today:', today);
      travelDate = today;
    }

    console.log('Booking payload:', {
      user_id: bookingData.user_id,
      booking_date: today,
      travel_date: travelDate,
      full_name: bookingData.passenger_name,
      email: bookingData.email,
      phone: bookingData.phone_number,
    });
    
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: bookingData.user_id,
        tour_id: null, // Explicitly set to null for flight bookings (not sending 0)
        tour_name: `${bookingData.flight_from} → ${bookingData.flight_to}`, // Flight route as tour_name
        booking_date: today, // Today's date in YYYY-MM-DD
        travel_date: travelDate, // Flight departure date in YYYY-MM-DD
        full_name: bookingData.passenger_name, // Passenger name
        email: bookingData.email.toLowerCase().trim(), // Passenger email - ensure it's valid
        phone: bookingData.phone_number, // Passenger phone
        number_of_travelers: bookingData.number_of_passengers,
        total_price: bookingData.total_price,
        payment_method: 'bank', // Use 'bank' instead of 'bank_transfer'
        status: bookingData.status || 'pending',
        // Flight-specific fields
        booking_type: 'flight',
        airline: bookingData.airline,
        flight_class: bookingData.flight_class,
        currency: bookingData.currency,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Booking creation failed:', response.status, errorText);
      try {
        const errorData = JSON.parse(errorText);
        console.error('Error details:', errorData);
        return {
          success: false,
          error: `Failed to create booking: ${errorData.message || response.statusText}`,
        };
      } catch {
        return {
          success: false,
          error: `Failed to create booking: ${response.statusText}`,
        };
      }
    }

    const data = await response.json();
    return {
      success: true,
      booking: data.booking || data,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Booking creation error:', errorMsg);
    return {
      success: false,
      error: errorMsg || 'Failed to create flight booking',
    };
  }
}
