import { Check, Calendar, Users, MapPin, CreditCard, Mail, Phone } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { formatCurrency } from '../utils/currencyConverter';
import { getTourImageUrl } from '../utils/imageHelper';

interface BookingConfirmationPageProps {
  bookingData?: {
    booking?: {
      id?: number;
      travel_date: string;
      number_of_travelers: number;
      total_price: number;
      full_name: string;
      email: string;
      phone: string;
      payment_method: string;
      booking_date: string;
      status: string;
      created_at?: string;
    };
    tour?: {
      id: number;
      name: string;
      destination: string;
      country: string;
      image?: string;
      price: number;
      duration: string;
    };
  };
  onNavigate: (page: string, data?: any) => void;
}

export function BookingConfirmationPage({ bookingData, onNavigate }: BookingConfirmationPageProps) {
  // Defensive checks for missing data
  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">No Booking Data</h2>
            <p className="text-gray-600 mb-6">
              Unable to display confirmation. Please complete the booking process.
            </p>
            <Button onClick={() => onNavigate('tours')} className="bg-blue-600 hover:bg-blue-700">
              Back to Tours
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const { booking, tour } = bookingData;

  // Check if booking and tour exist
  if (!booking || typeof booking !== 'object') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Invalid Booking Data</h2>
            <p className="text-gray-600 mb-6">
              The booking information is missing or invalid. Please try again.
            </p>
            <Button onClick={() => onNavigate('tours')} className="bg-blue-600 hover:bg-blue-700">
              Back to Tours
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!tour || typeof tour !== 'object') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Tour Information Missing</h2>
            <p className="text-gray-600 mb-6">
              The tour details could not be loaded. Please try again.
            </p>
            <Button onClick={() => onNavigate('tours')} className="bg-blue-600 hover:bg-blue-700">
              Back to Tours
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Safely extract required fields with defaults
  const confirmationNumber = booking?.id || Math.random().toString(36).substr(2, 9).toUpperCase();
  
  let travelDate = 'TBD';
  if (booking?.travel_date) {
    try {
      travelDate = new Date(booking.travel_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      travelDate = booking.travel_date;
    }
  }
  
  const travelers = booking?.number_of_travelers || 1;
  const totalPrice = typeof booking?.total_price === 'string' 
    ? parseFloat(booking.total_price) || 0 
    : (booking?.total_price || 0);
  const fullName = booking?.full_name || 'Guest';
  const email = booking?.email || 'Not provided';
  const phone = booking?.phone || 'Not provided';
  const paymentMethod = booking?.payment_method || 'Unknown';
  const status = booking?.status || 'pending';
  const tourName = tour?.name || 'Tour';
  const destination = tour?.destination || 'Destination';
  const country = tour?.country || 'Country';
  const duration = tour?.duration || 'Duration TBD';
  const price = typeof tour?.price === 'string' 
    ? parseFloat(tour.price) || 0 
    : (tour?.price || 0);
  const tourImage = tour?.image;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your tour booking has been successfully confirmed.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Confirmation Number */}
            <Card className="p-6 border-2 border-green-200 bg-green-50">
              <h3 className="font-bold text-lg mb-2 text-green-900">Confirmation Number</h3>
              <p className="text-3xl font-bold text-green-600 font-mono">{confirmationNumber}</p>
              <p className="text-sm text-gray-600 mt-2">
                Keep this number for your records. It will be sent to your email.
              </p>
            </Card>

            {/* Tour Details */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Tour Details</h3>
              
              <div className="flex gap-4 mb-4">
                <img
                  src={getTourImageUrl(tourImage)}
                  alt={tourName}
                  className="w-32 h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=200&h=200&fit=crop';
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-xl mb-1">{tourName}</h4>
                  <div className="flex items-center gap-1 text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{destination}, {country}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{duration}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Booking Information */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Booking Information</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Departure Date
                  </span>
                  <span className="font-medium">{travelDate}</span>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Number of Travelers
                  </span>
                  <span className="font-medium">{travelers}</span>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment Method
                  </span>
                  <span className="font-medium capitalize">{paymentMethod}</span>
                </div>

                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Booking Status</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium capitalize">
                    {status}
                  </span>
                </div>
              </div>
            </Card>

            {/* Traveler Information */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Traveler Information</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Full Name</span>
                  <span className="font-medium">{fullName}</span>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </span>
                  <span className="font-medium">{email}</span>
                </div>

                <div className="flex justify-between py-2">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </span>
                  <span className="font-medium">{phone}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-6">Price Summary</h3>

              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price per person</span>
                  <span className="font-medium">${price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Number of travelers</span>
                  <span className="font-medium">×{travelers}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold">Total Amount</span>
                <span className="text-2xl font-bold text-green-600">
                  ${typeof totalPrice === 'string' 
                    ? parseFloat(totalPrice).toFixed(2) 
                    : totalPrice.toFixed(2)}
                </span>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Next Steps:</strong> A confirmation email has been sent to {email}. Please check your inbox for booking details and instructions.
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => onNavigate('dashboard')} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Go to Dashboard
                </Button>
                <Button 
                  onClick={() => onNavigate('tours')} 
                  variant="outline"
                  className="w-full"
                >
                  Explore More Tours
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Free cancellation up to 24 hours before departure
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
