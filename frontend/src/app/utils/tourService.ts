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
  image?: string | File;
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
    
    // Use FormData to handle file uploads
    const formData = new FormData();
    formData.append('name', tourData.name);
    formData.append('destination', tourData.destination);
    formData.append('country', tourData.country);
    formData.append('price', String(tourData.price));
    formData.append('duration', tourData.duration);
    formData.append('category', tourData.category);
    
    if (tourData.rating) formData.append('rating', String(tourData.rating));
    if (tourData.description) formData.append('description', tourData.description);
    if (tourData.groupSize) formData.append('group_size', String(tourData.groupSize));
    
    // Handle image file or URL
    if (tourData.image) {
      if (tourData.image instanceof File) {
        formData.append('image', tourData.image);
      } else if (typeof tourData.image === 'string' && tourData.image) {
        // If it's a string URL, don't append it
        console.warn('String image URLs are no longer supported. Please use file upload.');
      }
    }
    
    // Handle arrays
    if (tourData.itinerary && tourData.itinerary.length > 0) {
      tourData.itinerary.forEach((item) => {
        formData.append('itinerary[]', item);
      });
    }
    
    if (tourData.included && tourData.included.length > 0) {
      tourData.included.forEach((item) => {
        formData.append('included[]', item);
      });
    }
    
    if (tourData.excluded && tourData.excluded.length > 0) {
      tourData.excluded.forEach((item) => {
        formData.append('excluded[]', item);
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/tours`, {
      method: 'POST',
      body: formData,
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
    
    // Use FormData to handle file uploads
    const formData = new FormData();
    
    if (tourData.name) formData.append('name', tourData.name);
    if (tourData.destination) formData.append('destination', tourData.destination);
    if (tourData.country) formData.append('country', tourData.country);
    if (tourData.price) formData.append('price', String(tourData.price));
    if (tourData.duration) formData.append('duration', tourData.duration);
    if (tourData.category) formData.append('category', tourData.category);
    if (tourData.rating !== undefined) formData.append('rating', String(tourData.rating));
    if (tourData.description) formData.append('description', tourData.description);
    if (tourData.groupSize) formData.append('group_size', String(tourData.groupSize));
    
    // Handle image file or URL
    if (tourData.image) {
      if (tourData.image instanceof File) {
        formData.append('image', tourData.image);
      }
    }
    
    // Handle arrays
    if (tourData.itinerary && tourData.itinerary.length > 0) {
      tourData.itinerary.forEach((item) => {
        formData.append('itinerary[]', item);
      });
    }
    
    if (tourData.included && tourData.included.length > 0) {
      tourData.included.forEach((item) => {
        formData.append('included[]', item);
      });
    }
    
    if (tourData.excluded && tourData.excluded.length > 0) {
      tourData.excluded.forEach((item) => {
        formData.append('excluded[]', item);
      });
    }
    
    // Use POST with method override for file uploads because many PHP setups
    // (including PHP-FPM/nginx) do not parse multipart bodies on PUT requests.
    formData.append('_method', 'PUT');
    const response = await fetch(`${API_BASE_URL}/tours/${id}`, {
      method: 'POST',
      body: formData,
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
