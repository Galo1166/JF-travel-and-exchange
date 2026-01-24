import { Check, Calendar, Users, MapPin, CreditCard, Mail, Phone } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { formatCurrency, convertCurrency } from '../utils/currencyConverter';
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
    flight?: {
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
    };
    passengers?: number;
    flightClass?: string;
    totalAmount?: number;
    selectedCurrency?: string;
    paymentStatus?: string;
  };
  onNavigate: (page: string, data?: any) => void;
  selectedCurrency?: string;
}

export function BookingConfirmationPage({ bookingData, onNavigate, selectedCurrency = 'USD' }: BookingConfirmationPageProps) {
  const isFlightBooking = bookingData?.flight && bookingData?.passengers;

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">No Booking Data</h2>
            <p className="text-gray-600 mb-6">Unable to display confirmation. Please complete the booking process.</p>
            <Button onClick={() => onNavigate('tours')} className="bg-blue-600 hover:bg-blue-700">
              Back to Tours
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const { booking, tour } = bookingData;

  if (!isFlightBooking && (!booking || !tour)) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Missing Booking Information</h2>
            <p className="text-gray-600 mb-6">The booking details could not be loaded. Please try again.</p>
            <Button onClick={() => onNavigate('tours')} className="bg-blue-600 hover:bg-blue-700">
              Back to Tours
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (isFlightBooking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Flight Booking Confirmed!</h1>
            <p className="text-gray-600">Your flight booking has been successfully confirmed.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 border-2 border-green-200 bg-green-50">
                <h3 className="font-bold text-lg mb-2 text-green-900">Booking Reference</h3>
                <p className="text-3xl font-bold text-green-600 font-mono">{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                <p className="text-sm text-gray-600 mt-2">Keep this reference for your records. A confirmation email will be sent shortly.</p>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Flight Details</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div>
                      <p className="text-sm text-gray-600">Airline</p>
                      <p className="font-bold text-lg">{bookingData?.flight?.airline}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Class</p>
                      <p className="font-bold">{bookingData?.flightClass || 'Economy'}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">From</p>
                      <p className="font-bold text-2xl">{bookingData?.flight?.from}</p>
                      <p className="text-sm">{bookingData?.flight?.departureTime}</p>
                    </div>
                    <div className="flex-1 flex justify-center">
                      <MapPin className="w-5 h-5 text-gray-400 transform rotate-90" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">To</p>
                      <p className="font-bold text-2xl">{bookingData?.flight?.to}</p>
                      <p className="text-sm">{bookingData?.flight?.arrivalTime}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-bold">{bookingData?.flight?.duration}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Passenger Information</h3>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="font-bold">{bookingData?.passengers} Passenger{(bookingData?.passengers || 0) > 1 ? 's' : ''}</span>
                </div>
              </Card>

              <Card className="p-6 bg-blue-50 border-blue-200">
                <h3 className="font-bold text-lg mb-4">Payment Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-bold">Bank Transfer ({bookingData?.selectedCurrency})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-bold text-green-600">✓ Confirmed</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-bold">Total Amount:</span>
                    <span className="font-bold text-lg text-green-600">
                      {bookingData?.selectedCurrency === 'NGN' ? '₦' : bookingData?.selectedCurrency === 'EUR' ? '€' : '$'} {(bookingData?.totalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 sticky top-4">
                <h3 className="font-bold text-lg mb-4">Summary</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Route</p>
                    <p className="font-bold">{bookingData?.flight?.from} → {bookingData?.flight?.to}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Class</p>
                    <p className="font-bold">{bookingData?.flightClass || 'Economy'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Passengers</p>
                    <p className="font-bold">{bookingData?.passengers}</p>
                  </div>
                  <div className="pt-3 border-t border-green-200">
                    <p className="text-gray-600">Total</p>
                    <p className="font-bold text-lg text-green-600">
                      {bookingData?.selectedCurrency === 'NGN' ? '₦' : bookingData?.selectedCurrency === 'EUR' ? '€' : '$'} {(bookingData?.totalAmount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Next Steps</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="font-bold text-green-600">1.</span>
                    <span>Check email for confirmation</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-green-600">2.</span>
                    <span>Download your e-ticket</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-green-600">3.</span>
                    <span>Arrive 2 hours early</span>
                  </li>
                </ol>
              </Card>

              <Button onClick={() => onNavigate('home')} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg">
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tour Booking Confirmation
  const confirmationNumber = booking?.id || Math.random().toString(36).substr(2, 9).toUpperCase();
  let travelDate = 'TBD';
  if (booking?.travel_date) {
    try {
      travelDate = new Date(booking.travel_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      travelDate = booking.travel_date;
    }
  }

  const travelers = booking?.number_of_travelers || 1;
  const totalPrice = typeof booking?.total_price === 'string' ? parseFloat(booking.total_price) || 0 : (booking?.total_price || 0);
  const fullName = booking?.full_name || 'Guest';
  const email = booking?.email || 'Not provided';
  const phone = booking?.phone || 'Not provided';
  const paymentMethod = booking?.payment_method || 'Unknown';
  const status = booking?.status || 'pending';
  const tourName = tour?.name || 'Tour';
  const destination = tour?.destination || 'Destination';
  const country = tour?.country || 'Country';
  const duration = tour?.duration || 'Duration TBD';
  const price = typeof tour?.price === 'string' ? parseFloat(tour.price) || 0 : (tour?.price || 0);
  const tourImage = tour?.image;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your tour booking has been successfully confirmed.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border-2 border-green-200 bg-green-50">
              <h3 className="font-bold text-lg mb-2 text-green-900">Confirmation Number</h3>
              <p className="text-3xl font-bold text-green-600 font-mono">{confirmationNumber}</p>
              <p className="text-sm text-gray-600 mt-2">Keep this number for your records. It will be sent to your email.</p>
              <div className="mt-4 pt-4 border-t border-green-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-600" />
                  <span className="text-sm"><strong>Email:</strong> {email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-600" />
                  <span className="text-sm"><strong>Phone:</strong> {phone}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Tour Details</h3>
              <div className="flex gap-4 mb-4">
                <img src={getTourImageUrl(tourImage)} alt={tourName} className="w-32 h-32 object-cover rounded-lg" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=200&h=200&fit=crop'; }} />
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

            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Booking Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 flex items-center gap-2"><Calendar className="w-4 h-4" /> Departure</span>
                  <span className="font-medium">{travelDate}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 flex items-center gap-2"><Users className="w-4 h-4" /> Travelers</span>
                  <span className="font-medium">{travelers}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment</span>
                  <span className="font-medium capitalize">{paymentMethod}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Status</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium capitalize">{status}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Traveler Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium">{fullName}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 flex items-center gap-2"><Mail className="w-4 h-4" /> Email</span>
                  <span className="font-medium">{email}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 flex items-center gap-2"><Phone className="w-4 h-4" /> Phone</span>
                  <span className="font-medium">{phone}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 sticky top-4">
              <h3 className="font-bold text-lg mb-6">Price Summary</h3>
              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price per person</span>
                  <span className="font-medium">{formatCurrency(convertCurrency(price, 'USD', selectedCurrency), selectedCurrency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Travelers</span>
                  <span className="font-medium">×{travelers}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold">Total Amount</span>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(typeof totalPrice === 'string' ? parseFloat(totalPrice) : totalPrice, "USD")}</span>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-800"><strong>Next Steps:</strong> A confirmation email has been sent to {email}. Check your inbox for details.</p>
              </div>

              <div className="space-y-3">
                <Button onClick={() => onNavigate('dashboard')} className="w-full bg-blue-600 hover:bg-blue-700">
                  Go to Dashboard
                </Button>
                <Button onClick={() => onNavigate('tours')} variant="outline" className="w-full">
                  Explore More Tours
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">Free cancellation up to 24 hours before departure</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
