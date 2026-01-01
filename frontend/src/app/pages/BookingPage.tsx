import { useState, useEffect } from 'react';
import { Check, Calendar, Users, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { tours as mockTours } from '../data/mockData';
import { convertCurrency, formatCurrency } from '../utils/currencyConverter';
import { getTourById } from '../utils/tourService';
import { getTourImageUrl } from '../utils/imageHelper';
import { createBooking } from '../utils/bookingService';
import { getUserByEmail } from '../utils/userService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import type { TourData } from '../utils/tourService';

interface BookingPageProps {
  tourId: string;
  onNavigate: (page: string, data?: any) => void;
  isAuthenticated: boolean;
  selectedCurrency?: string;
}

export function BookingPage({ tourId, onNavigate, isAuthenticated, selectedCurrency = 'USD' }: BookingPageProps) {
  const { user } = useAuth();
  const [tour, setTour] = useState<TourData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    date: '',
    travelers: 1,
    fullName: '',
    email: '',
    phone: '',
    paymentMethod: 'paystack'
  });

  // Fetch tour data
  useEffect(() => {
    const fetchTour = async () => {
      try {
        setIsLoading(true);
        
        const numericId = parseInt(tourId, 10);
        if (!isNaN(numericId)) {
          const result = await getTourById(numericId);
          
          if (result.success && result.tour) {
            setTour(result.tour);
            console.log('Loaded tour from database:', result.tour.id);
            return;
          }
        }
        
        const mockTour = mockTours.find((t) => t.id === tourId);
        if (mockTour) {
          setTour(mockTour);
          console.log('Using mock tour data for ID:', tourId);
        } else {
          console.warn('Tour not found with ID:', tourId);
          setTour(null);
        }
      } catch (error) {
        console.error('Error fetching tour:', error);
        const mockTour = mockTours.find((t) => t.id === tourId);
        if (mockTour) {
          setTour(mockTour);
        } else {
          setTour(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTour();
  }, [tourId]);

  // Prefill user profile data
  useEffect(() => {
    if (user && step === 2) {
      setFormData(prev => ({
        ...prev,
        fullName: user.displayName || '',
        email: user.email || '',
      }));
    }
  }, [user, step]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Loading tour details...</p>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Tour Not Found</h2>
          <Button onClick={() => onNavigate('tours')}>Back to Tours</Button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">
            Please login to continue with your booking
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => onNavigate('login')} className="bg-blue-600 hover:bg-blue-700">
              Login
            </Button>
            <Button onClick={() => onNavigate('register')} variant="outline">
              Create Account
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const convertedPrice = convertCurrency(tour.price, 'USD', selectedCurrency);
  const totalPrice = convertedPrice * formData.travelers;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!formData.date || formData.travelers < 1) {
        toast.error('Please fill in all required fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.fullName || !formData.email || !formData.phone) {
        toast.error('Please fill in all required fields');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      await processBooking();
    }
  };

  const processBooking = async () => {
    try {
      setIsSubmitting(true);

      // Get user_id from database using email
      if (!user?.email) {
        toast.error('User email not found');
        return;
      }

      console.log('Processing booking: Getting user_id for', user.email);
      const userResult = await getUserByEmail(user.email);

      if (!userResult.success || !userResult.user) {
        toast.error('Unable to process booking: User not found in database');
        console.error('User lookup failed:', userResult.error);
        return;
      }

      const bookingData = {
        user_id: userResult.user.id,
        tour_id: typeof tour.id === 'string' ? parseInt(tour.id, 10) : tour.id,
        travel_date: formData.date,
        number_of_travelers: formData.travelers,
        total_price: totalPrice,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        payment_method: formData.paymentMethod,
        booking_date: new Date().toISOString().split('T')[0],
        status: 'pending',
      };

      console.log('Processing booking:', bookingData);

      // Get Firebase token for authentication
      const token = await user.getIdToken();
      const result = await createBooking(bookingData, token);

      if (result.success) {
        toast.success('Booking confirmed successfully!');
        // Store booking info in session/state for confirmation page
        onNavigate('booking-confirmation', { 
          booking: result.booking,
          tour: tour 
        });
      } else {
        toast.error(result.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('An error occurred while processing your booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 md:w-32 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-8 mt-4 text-sm">
            <span className={step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-600'}>Tour Details</span>
            <span className={step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-600'}>Your Info</span>
            <span className={step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-600'}>Payment</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <form onSubmit={handleSubmit}>
                {/* Step 1: Tour Details */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Select Your Tour Details</h2>
                      <p className="text-gray-600">Choose your preferred date and number of travelers</p>
                    </div>

                    <div>
                      <Label htmlFor="date" className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4" />
                        Departure Date *
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                        className="text-base"
                      />
                    </div>

                    <div>
                      <Label htmlFor="travelers" className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4" />
                        Number of Travelers *
                      </Label>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setFormData({ 
                            ...formData, 
                            travelers: Math.max(1, formData.travelers - 1) 
                          })}
                          className="w-12 h-12"
                        >
                          −
                        </Button>
                        <Input
                          id="travelers"
                          type="number"
                          min="1"
                          max="50"
                          value={formData.travelers}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val >= 1 && val <= 50) {
                              setFormData({ ...formData, travelers: val });
                            }
                          }}
                          className="w-24 text-center text-lg font-semibold"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setFormData({ 
                            ...formData, 
                            travelers: Math.min(50, formData.travelers + 1) 
                          })}
                          className="w-12 h-12"
                        >
                          +
                        </Button>
                        <span className="text-gray-600 ml-4">{formData.travelers} {formData.travelers === 1 ? 'person' : 'people'}</span>
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                      Continue
                    </Button>
                  </div>
                )}

                {/* Step 2: Traveler Information */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Traveler Information</h2>
                      <p className="text-gray-600">Please provide your contact details</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-800">
                        These details will be used for your booking confirmation and communication.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setStep(1)} 
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                        Continue
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Payment Method</h2>
                      <p className="text-gray-600">Choose how you'd like to pay</p>
                    </div>

                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-4 h-4" />
                        Payment Method *
                      </Label>
                      
                      {[
                        { value: 'paystack', label: 'Paystack', desc: 'Pay securely with card' },
                        { value: 'paypal', label: 'PayPal', desc: 'Pay with PayPal account' },
                        { value: 'bank', label: 'Bank Transfer', desc: 'Direct bank transfer' },
                      ].map((method) => (
                        <label key={method.value} className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-blue-600 transition-colors">
                          <input
                            type="radio"
                            name="payment"
                            value={method.value}
                            checked={formData.paymentMethod === method.value}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            className="mr-3"
                          />
                          <div>
                            <p className="font-medium">{method.label}</p>
                            <p className="text-sm text-gray-500">{method.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setStep(2)} 
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Booking Summary</h3>
              
              <div className="mb-4">
                <img
                  src={getTourImageUrl(tour.image)}
                  alt={tour.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop';
                  }}
                />
                <h4 className="font-semibold mb-1">{tour.name}</h4>
                <p className="text-sm text-gray-600">{tour.destination}, {tour.country}</p>
              </div>

              <div className="space-y-3 py-4 border-t border-b">
                {formData.date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Departure Date</span>
                    <span className="font-medium">{new Date(formData.date).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Travelers</span>
                  <span className="font-medium">{formData.travelers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price per person</span>
                  <span className="font-medium">{formatCurrency(convertedPrice, selectedCurrency)}</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <span className="font-bold">Total Amount</span>
                <span className="text-2xl font-bold text-blue-600">{formatCurrency(totalPrice, selectedCurrency)}</span>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                * All prices shown in {selectedCurrency}. Free cancellation up to 24 hours before departure.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
