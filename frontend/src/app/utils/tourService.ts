/**
 * Tour Management API Service
 * Handles all tour CRUD operations
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface TourData {
  id?: number;
  name: string;
  destination: string;
  country: string;
  price: number;
  duration: string;
  category: string;
  rating?: number;
  description?: string;
  image?: string;
  groupSize?: number;
  itinerary?: string[];
  included?: string[];
  excluded?: string[];
}

/**
 * Get all tours
 */
export async function getAllTours(): Promise<{
  success: boolean;
  tours?: TourData[];
  error?: string;
}> {
  try {
    console.log('getAllTours: Fetching all tours');
    
    const response = await fetch(`${API_BASE_URL}/tours`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('getAllTours: Response status', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('getAllTours: Failed with status', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    console.log('getAllTours: Success, retrieved', data.tours?.length || 0, 'tours');
    return data;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('getAllTours: Error', errorMsg);
    return {
      success: false,
      error: errorMsg || 'Failed to fetch tours',
    };
  }
}

/**
 * Get a single tour by ID
 */
export async function getTourById(id: number): Promise<{
  success: boolean;
  tour?: TourData;
  error?: string;
}> {
  try {
    console.log('getTourById: Fetching tour', id);
    
    const response = await fetch(`${API_BASE_URL}/tours/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('getTourById: Response status', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('getTourById: Failed with status', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    console.log('getTourById: Success', data);
    return data;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('getTourById: Error', errorMsg);
    return {
      success: false,
      error: errorMsg || 'Failed to fetch tour',
    };
  }
}

/**
 * Create a new tour
 */
export async function createTour(tourData: TourData): Promise<{
  success: boolean;
  tour?: TourData;
  error?: string;
}> {
  try {
    if (!tourData.name || !tourData.destination || !tourData.country || !tourData.price) {
      console.error('createTour: Missing required fields', tourData);
      return {
        success: false,
        error: 'Missing required fields: name, destination, country, or price',
      };
    }

    console.log('createTour: Creating tour', tourData);
    
    const response = await fetch(`${API_BASE_URL}/tours`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tourData),
    });

    console.log('createTour: Response status', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('createTour: Failed with status', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    console.log('createTour: Success', data);
    return data;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('createTour: Error', errorMsg);
    return {
      success: false,
      error: errorMsg || 'Failed to create tour',
    };
  }
}

/**
 * Update an existing tour
 */
export async function updateTour(id: number, tourData: Partial<TourData>): Promise<{
  success: boolean;
  tour?: TourData;
  error?: string;
}> {
  try {
    if (!id) {
      console.error('updateTour: Tour ID is required');
      return {
        success: false,
        error: 'Tour ID is required',
      };
    }

    console.log('updateTour: Updating tour', id, tourData);
    
    const response = await fetch(`${API_BASE_URL}/tours/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tourData),
    });

    console.log('updateTour: Response status', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('updateTour: Failed with status', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    console.log('updateTour: Success', data);
    return data;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('updateTour: Error', errorMsg);
    return {
      success: false,
      error: errorMsg || 'Failed to update tour',
    };
  }
}

/**
 * Delete a tour
 */
export async function deleteTour(id: number): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    if (!id) {
      console.error('deleteTour: Tour ID is required');
      return {
        success: false,
        error: 'Tour ID is required',
      };
    }

    console.log('deleteTour: Deleting tour', id);
    
    const response = await fetch(`${API_BASE_URL}/tours/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('deleteTour: Response status', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('deleteTour: Failed with status', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    console.log('deleteTour: Success', data);
    return data;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('deleteTour: Error', errorMsg);
    return {
      success: false,
      error: errorMsg || 'Failed to delete tour',
    };
  }
}
