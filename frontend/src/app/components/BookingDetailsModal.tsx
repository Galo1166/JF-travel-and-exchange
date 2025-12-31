import { X, Calendar, Users, Mail, Phone, CreditCard, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { formatCurrency } from '../utils/currencyConverter';

interface BookingDetailsModalProps {
  booking: any;
  onClose: () => void;
  selectedCurrency?: string;
}

export function BookingDetailsModal({ booking, onClose, selectedCurrency = 'USD' }: BookingDetailsModalProps) {
  if (!booking) return null;

  const travelDate = new Date(booking.travel_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const bookingDate = new Date(booking.booking_date || booking.created_at).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">Booking Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Confirmation Number */}
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Confirmation Number</p>
            <p className="text-2xl font-bold text-blue-600 font-mono">#{booking.id}</p>
          </div>

          {/* Booking Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Booking Status</p>
              <Badge
                variant={
                  booking.status === 'confirmed'
                    ? 'default'
                    : booking.status === 'pending'
                    ? 'secondary'
                    : 'destructive'
                }
                className="text-base px-4 py-2"
              >
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Booking Date</p>
              <p className="font-medium">{bookingDate}</p>
            </div>
          </div>

          {/* Tour Information */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Tour Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Tour Name</p>
                <p className="font-medium text-lg">{booking.tour_name}</p>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-600">Price per Person</p>
                  <p className="font-medium">${(booking.total_price / booking.number_of_travelers).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tour ID</p>
                  <p className="font-medium">#{booking.tour_id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Travel Details */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Travel Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Departure Date</p>
                <p className="font-medium">{travelDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Number of Travelers</p>
                <p className="font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {booking.number_of_travelers} {booking.number_of_travelers === 1 ? 'person' : 'people'}
                </p>
              </div>
            </div>
          </div>

          {/* Traveler Information */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-lg mb-4">Traveler Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-medium">{booking.full_name}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </p>
                  <p className="font-medium break-all">{booking.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </p>
                  <p className="font-medium">{booking.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-medium capitalize">{booking.payment_method}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-bold text-lg text-green-600">
                  {formatCurrency(booking.total_price, selectedCurrency)}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-6 flex gap-3">
            <Button
              onClick={onClose}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
