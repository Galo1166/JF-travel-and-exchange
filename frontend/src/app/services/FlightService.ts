import axios from 'axios';

// Define the API URL based on environment or default to local
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Normalize API URL - avoid double /api
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

export interface FlightSearchParams {
    origin: string;
    destination: string;
    departureDate: string;
    adults?: number;
}

export interface FlightOffer {
    airline: string;
    airlineCode: string;
    from: string;
    to: string;
    departureTime: string;
    arrivalTime: string;
    price: number;
    basePrice: number;
    currency: string;
    duration: string;
}

export interface FlightSearchResponse {
    data: FlightOffer[];
    meta: {
        count: number;
    };
}

export const FlightService = {
    /**
     * Search for flights
     */
    searchFlights: async (params: FlightSearchParams): Promise<FlightOffer[]> => {
        try {
            const response = await axios.get<FlightSearchResponse>(`${API_URL}/flights/search`, {
                params
            });
            return response.data.data;
        } catch (error) {
            console.error('Flight search failed:', error);
            throw error;
        }
    }
};
