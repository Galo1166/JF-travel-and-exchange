import { Calendar, ArrowLeftRight, Plus, Eye, Edit2, Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { convertCurrency, formatCurrency } from '../utils/currencyConverter';
import { useAuth } from '../context/AuthContext';
import { getUserBookings, updateUserProfile } from '../utils/userService';
import { toast } from 'sonner';

interface UserDashboardProps {
  onNavigate: (page: string, data?: any) => void;
  selectedCurrency?: string;
  onCurrencyChange?: (currency: string) => void;
}

export function UserDashboard({ 
  onNavigate, 
  selectedCurrency = 'USD',
  onCurrencyChange 
}: UserDashboardProps) {
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState(selectedCurrency);
  const [savingProfile, setSavingProfile] = useState(false);

  // Fetch user's bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.accessToken) return;
      
      try {
        setLoadingBookings(true);
        const result = await getUserBookings(user.accessToken);
        if (result.success && result.bookings) {
          setBookings(result.bookings);
        }
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, [user?.accessToken]);

  const handleSaveProfile = async () => {
    if (!user?.accessToken) {
      toast.error('Not authenticated');
      return;
    }

    try {
      setSavingProfile(true);
      const result = await updateUserProfile(user.accessToken, {
        phone_number: phoneNumber || undefined,
        preferred_currency: preferredCurrency || undefined,
      });

      if (result.success) {
        toast.success('Profile updated successfully');
        if (preferredCurrency !== selectedCurrency && onCurrencyChange) {
          onCurrencyChange(preferredCurrency);
        }
        setEditingProfile(false);
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('An error occurred while updating profile');
    } finally {
      setSavingProfile(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {displayName}!</h1>
          <p className="text-blue-100">Manage your bookings and travel history</p>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Active Bookings</p>
            <p className="text-3xl font-bold text-gray-900">{bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length}</p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <ArrowLeftRight className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="transactions">Summary</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">My Bookings</h2>
                <Button
                  onClick={() => onNavigate('tours')}
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Book New Tour
                </Button>
              </div>

              {loadingBookings ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading bookings...</p>
                </div>
              ) : bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="mb-4 md:mb-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{booking.tour_name}</h3>
                          <Badge
                            variant={
                              booking.status === 'confirmed'
                                ? 'default'
                                : booking.status === 'pending'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Booking ID: #{booking.id}</p>
                          <p>Travel Date: {new Date(booking.travel_date).toLocaleDateString()}</p>
                          <p>Travelers: {booking.number_of_travelers} person{booking.number_of_travelers > 1 ? 's' : ''}</p>
                          <p>Booked on: {new Date(booking.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(convertCurrency(booking.total_price, 'USD', selectedCurrency), selectedCurrency)}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => onNavigate('tour-details', { tourId: booking.tour_id })}
                            size="sm"
                            variant="outline"
                            className="gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No bookings yet</p>
                  <Button onClick={() => onNavigate('tours')}>Browse Tours</Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="transactions" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Booking Summary</h2>
              
              {bookings.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Total Spent</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(
                          convertCurrency(
                            bookings.reduce((sum, b) => sum + (b.total_price || 0), 0),
                            'USD',
                            selectedCurrency
                          ),
                          selectedCurrency
                        )}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Confirmed Bookings</p>
                      <p className="text-2xl font-bold text-green-600">
                        {bookings.filter(b => b.status === 'confirmed').length}
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Pending Bookings</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {bookings.filter(b => b.status === 'pending').length}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
                    <div className="space-y-3">
                      {bookings.slice(0, 5).map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{booking.tour_name}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(booking.travel_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {formatCurrency(convertCurrency(booking.total_price, 'USD', selectedCurrency), selectedCurrency)}
                            </p>
                            <Badge
                              variant={
                                booking.status === 'confirmed'
                                  ? 'default'
                                  : booking.status === 'pending'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                              className="text-xs"
                            >
                              {booking.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ArrowLeftRight className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No booking history yet</p>
                  <Button onClick={() => onNavigate('tours')}>Start Booking</Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Profile Settings</h2>
                {!editingProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingProfile(true)}
                    className="gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <p className="p-3 bg-gray-50 rounded-lg">{displayName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <p className="p-3 bg-gray-50 rounded-lg">{user?.email || 'N/A'}</p>
                  </div>
                  
                  {editingProfile ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Enter phone number"
                          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Preferred Currency</label>
                        <select
                          value={preferredCurrency}
                          onChange={(e) => setPreferredCurrency(e.target.value)}
                          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="NGN">NGN - Nigerian Naira</option>
                          <option value="GHS">GHS - Ghanaian Cedi</option>
                          <option value="KES">KES - Kenyan Shilling</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone Number</label>
                        <p className="p-3 bg-gray-50 rounded-lg">{phoneNumber || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Preferred Currency</label>
                        <p className="p-3 bg-gray-50 rounded-lg">{preferredCurrency}</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-3">
                  {editingProfile ? (
                    <>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        <Check className="w-4 h-4" />
                        {savingProfile ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        onClick={() => setEditingProfile(false)}
                        variant="outline"
                        className="gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline">Change Password</Button>
                  )}
                </div>

                <div className="pt-6 border-t">
                  <p className="text-sm text-gray-600">
                    <strong>Member Since:</strong> {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'January 2024'}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
