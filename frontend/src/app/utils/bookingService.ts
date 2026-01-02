/**
 * Booking API Service Functions
 * Handles all tour booking operations
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface BookingData {
  id?: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  phone?: string;
  tour_id: number;
  tour_name?: string;
  booking_date: string;
  travel_date: string;
  number_of_travelers: number;
  total_price: number | string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_method?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get all tour bookings
 * @returns Promise with array of bookings
 */
export async function getAllBookings(): Promise<{
  success: boolean;
  bookings?: BookingData[];
  error?: string;
}> {
  try {
    console.log('getAllBookings: Fetching all bookings');

    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('getAllBookings: Response status', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('getAllBookings: Failed with status', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    console.log('getAllBookings: Success, received', data.total || 0, 'bookings');
    return {
      success: true,
      bookings: data.bookings || [],
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('getAllBookings: Error', errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Get a specific booking by ID
 * @param id - Booking ID
 * @returns Promise with booking data
 */
export async function getBookingById(id: number): Promise<{
  success: boolean;
  booking?: BookingData;
  error?: string;
}> {
  try {
    console.log('getBookingById: Fetching booking', { id });

    const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('getBookingById: Response status', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('getBookingById: Failed with status', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    console.log('getBookingById: Success', data.booking);
    return {
      success: true,
      booking: data.booking,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('getBookingById: Error', errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Create a new booking
 * @param bookingData - Booking information
 * @param token - Firebase ID token for authentication
 * @returns Promise with created booking
 */
export async function createBooking(bookingData: Partial<BookingData>, token?: string): Promise<{
  success: boolean;
  booking?: BookingData;
  error?: string;
}> {
  try {
    console.log('createBooking: Creating booking', bookingData);

    // Validate required fields
    if (!bookingData.user_id || !bookingData.tour_id || !bookingData.booking_date || !bookingData.travel_date || !bookingData.number_of_travelers || bookingData.total_price === undefined) {
      console.error('createBooking: Missing required fields', bookingData);
      return {
        success: false,
        error: 'Missing required fields: user_id, tour_id, booking_date, travel_date, number_of_travelers, total_price',
      };
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...bookingData,
        status: bookingData.status || 'pending',
      }),
    });

    console.log('createBooking: Response status', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('createBooking: Failed with status', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    console.log('createBooking: Success', data.booking);
    return {
      success: true,
      booking: data.booking,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('createBooking: Error', errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Update booking status (pending → completed, etc)
 * @param id - Booking ID
 * @param status - New status
 * @param token - Firebase ID token for authentication
 * @returns Promise with updated booking
 */
export async function updateBookingStatus(
  id: number,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  token?: string
): Promise<{
  success: boolean;
  booking?: BookingData;
  error?: string;
}> {
  try {
    console.log('updateBookingStatus: Updating booking status', { id, status });

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status }),
    });

    console.log('updateBookingStatus: Response status', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('updateBookingStatus: Failed with status', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    console.log('updateBookingStatus: Success', data.booking);
    return {
      success: true,
      booking: data.booking,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('updateBookingStatus: Error', errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Update entire booking
 * @param id - Booking ID
 * @param bookingData - Updated booking data
 * @param token - Firebase ID token for authentication
 * @returns Promise with updated booking
 */
export async function updateBooking(
  id: number,
  bookingData: Partial<BookingData>,
  token?: string
): Promise<{
  success: boolean;
  booking?: BookingData;
  error?: string;
}> {
  try {
    console.log('updateBooking: Updating booking', { id, bookingData });

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(bookingData),
    });

    console.log('updateBooking: Response status', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('updateBooking: Failed with status', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    console.log('updateBooking: Success', data.booking);
    return {
      success: true,
      booking: data.booking,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('updateBooking: Error', errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Delete a booking
 * @param id - Booking ID
 * @param token - Firebase ID token for authentication
 * @returns Promise with success status
 */
export async function deleteBooking(id: number, token?: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log('deleteBooking: Deleting booking', { id });

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: 'DELETE',
      headers,
    });

    console.log('deleteBooking: Response status', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('deleteBooking: Failed with status', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    console.log('deleteBooking: Success');
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('deleteBooking: Error', errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}
