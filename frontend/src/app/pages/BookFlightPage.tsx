
import React, { useState } from 'react';

import { FlightSearchForm } from '../components/FlightSearchForm';
import { FlightResultCard } from '../components/FlightResultCard';
import { FlightBookingModal3Step, BookingDetails } from '../components/FlightBookingModal3Step';
import { FlightService, FlightSearchParams, FlightOffer } from '../services/FlightService';
import { createFlightBooking, getUserByEmail } from '../utils/userService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface BookFlightPageProps {
  onNavigate?: (page: string, data?: any) => void;
  selectedCurrency?: string;
  isAuthenticated?: boolean;
}

export const BookFlightPage: React.FC<BookFlightPageProps> = ({
  onNavigate,
  selectedCurrency = 'USD',
  isAuthenticated = false
}) => {
  const { user } = useAuth();
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<FlightOffer | null>(null);
  const [passengers, setPassengers] = useState(1);
  const [departureDate, setDepartureDate] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<'all' | 'nigerian-local'>('all');

  const handleSearch = async (params: FlightSearchParams) => {
    setIsLoading(true);
    setError(null);
    setFlights([]);
    setPassengers(params.adults || 1); // Store passengers count for booking modal
    setDepartureDate(params.departureDate); // Store the departure date from search params

    try {
      let results: FlightOffer[];
      
      if (searchFilter === 'nigerian-local') {
        results = await FlightService.searchNigerianLocalFlights(params);
      } else if (searchFilter === 'all') {
        // Use fallback search - tries Amadeus first, falls back to static if unavailable
        results = await FlightService.searchFlightsWithFallback(params);
      } else {
        results = await FlightService.searchFlights(params);
      }
      
      setFlights(results);
      setHasSearched(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search flights. Please try again later.';
      setError(errorMessage);
      console.error(err);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookFlight = (flight: FlightOffer) => {
    setSelectedFlight(flight);
  };

  const handleCloseBookingModal = () => {
    setSelectedFlight(null);
  };

  const handleBookingConfirm = async (bookingDetails: BookingDetails) => {
    console.log('Booking confirmed:', bookingDetails);

    if (!user?.email) {
      toast.error('User email not found');
      return;
    }

    try {
      // Get Firebase ID token
      const token = await user.getIdToken();

      // Get user ID from email
      const userResult = await getUserByEmail(user.email);
      if (!userResult.success || !userResult.user) {
        toast.error('Failed to retrieve user information');
        return;
      }

      const userId = userResult.user.id;

      // Save flight booking to database
      const result = await createFlightBooking({
        user_email: user.email,
        user_id: userId,
        passenger_name: bookingDetails.passengerName,
        email: bookingDetails.email,
        phone_number: bookingDetails.phoneNumber,
        flight_from: bookingDetails.flight.from,
        flight_to: bookingDetails.flight.to,
        departure_date: departureDate, // Use stored departure date (YYYY-MM-DD format)
        airline: bookingDetails.flight.airline,
        number_of_passengers: bookingDetails.passengers,
        total_price: bookingDetails.convertedAmount,
        currency: bookingDetails.currency,
        flight_class: bookingDetails.flightClass,
        status: 'pending',
      }, token);

      if (result.success) {
        toast.success('Flight booking saved successfully!');
        setSelectedFlight(null);
        // Navigate to dashboard or confirmation page
        if (onNavigate) {
          onNavigate('dashboard', bookingDetails);
        }
      } else {
        toast.error(result.error || 'Failed to save booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('An error occurred while saving your booking');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">


      <main className="flex-grow">
        {/* Hero Section */}
        <div
          className="relative bg-blue-900 text-white py-20 px-4 mb-8 bg-cover bg-center"
          style={{
            backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.4)), url("/hero-airplane.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Book Your Flight
            </h1>
            <p className="text-xl text-blue-100">
              Reliable, secure, and instant flight bookings
            </p>
          </div>
        </div>

        {/* Flight Search Section */}
        <div className="max-w-6xl mx-auto py-4 px-4 -mt-16 pb-20">
          <FlightSearchForm onSearch={handleSearch} isLoading={isLoading} />

          {/* Flight Type Filter */}
          <div className="mt-6 flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => setSearchFilter('all')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                searchFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
              }`}
            >
              All Flights
            </button>
            <button
              onClick={() => setSearchFilter('nigerian-local')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                searchFilter === 'nigerian-local'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-green-600'
              }`}
            >
              🇳🇬 Nigerian Local
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="max-w-2xl mx-auto mt-8 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Results Area */}
          <div className="mt-8">
            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Searching for {searchFilter === 'nigerian-local' ? 'Nigerian local' : 'the best'} flights...</p>
              </div>
            )}

            {!isLoading && hasSearched && flights.length === 0 && !error && (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                <p className="text-xl text-gray-700 font-medium mb-2">No flights found</p>
                <p className="text-gray-500">Try changing your dates or airports.</p>
              </div>
            )}

            {!isLoading && flights.length > 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {searchFilter === 'nigerian-local' ? '🇳🇬 Nigerian Local Flights' : 'Available Flights'} ({flights.length})
                  </h2>
                  {searchFilter === 'nigerian-local' && (
                    <p className="text-sm text-gray-600">Domestic flights within Nigeria</p>
                  )}
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {flights.map((flight, index) => (
                    <FlightResultCard
                      key={`${flight.airlineCode}-${index}`}
                      flight={flight}
                      onBook={() => setSelectedFlight(flight)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>


      {/* Flight Booking Modal */}
      {selectedFlight && (
        <FlightBookingModal3Step
          flight={selectedFlight}
          passengers={passengers}
          selectedCurrency={selectedCurrency}
          onClose={handleCloseBookingModal}
          onConfirm={handleBookingConfirm}
        />
      )}
    </div>
  );
};
