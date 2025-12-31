import { getUserByEmail } from './userService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export async function getUserBookingsByEmail(email: string): Promise<{ success: boolean; bookings?: any[]; error?: string }> {
  try {
    if (!email) return { success: false, error: 'Email required' };

    const userResult = await getUserByEmail(email);
    if (!userResult.success || !userResult.user) return { success: false, error: 'User not found' };

    const userId = userResult.user.id;

    const response = await fetch(`${API_BASE_URL}/bookings`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `Failed to fetch bookings: ${response.status} ${text}` };
    }

    const data = await response.json();
    const bookings = (data.bookings || data).filter((b: any) => b.user_id === userId);
    return { success: true, bookings };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}
