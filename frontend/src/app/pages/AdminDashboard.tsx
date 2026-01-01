import { DollarSign, ChevronLeft, Users, Plane, TrendingUp, Edit, Trash2, Plus, X, FileText, TrendingDown, Download, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { tours, mockBookings, currencyRates } from '../data/mockData';
import { convertCurrency, formatCurrency } from '../utils/currencyConverter';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getAllTours, createTour, updateTour, deleteTour, TourData } from '../utils/tourService';
import { getAllBookings, updateBookingStatus, BookingData } from '../utils/bookingService';
import { getAllExchangeRates, createExchangeRate, updateExchangeRate, deleteExchangeRate, ExchangeRateData } from '../utils/exchangeRateService';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
  selectedCurrency?: string;
}

export function AdminDashboard({ onNavigate, selectedCurrency }: AdminDashboardProps) {
  const [databaseTours, setDatabaseTours] = useState<TourData[]>([]);
  const [databaseBookings, setDatabaseBookings] = useState<BookingData[]>([]);
  const [databaseRates, setDatabaseRates] = useState<ExchangeRateData[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [bookingFilter, setBookingFilter] = useState<string>('all');
  const [transactionFilter, setTransactionFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [editingTour, setEditingTour] = useState<TourData | null>(null);
  const [editingRate, setEditingRate] = useState<ExchangeRateData | null>(null);
  const [formData, setFormData] = useState<Partial<TourData>>({
    name: '',
    destination: '',
    country: '',
    price: 0,
    duration: '',
    category: 'adventure',
    rating: 0,
    description: '',
    itinerary: [],
    included: [],
    excluded: [],
  });
  const [rateFormData, setRateFormData] = useState<Partial<ExchangeRateData>>({
    code: '',
    name: '',
    rate: 0,
    buy_rate: 0,
    sell_rate: 0,
    flag: '',
  });
  const [selectedRate, setSelectedRate] = useState<string | null>(null);

  // Load tours and bookings from database
  useEffect(() => {
    loadTours();
    loadBookings();
    loadExchangeRates();
    loadUsersAndTransactions();
  }, []);

  const loadTours = async () => {
    setIsLoading(true);
    try {
      const result = await getAllTours();
      if (result.success && result.tours) {
        setDatabaseTours(result.tours);
      }
    } catch (error) {
      console.error('Error loading tours:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const result = await getAllBookings();
      if (result.success && result.bookings) {
        setDatabaseBookings(result.bookings);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const handleUpdateBookingStatus = async (id: number, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    try {
      const result = await updateBookingStatus(id, newStatus);
      if (result.success) {
        toast.success(`Booking status updated to ${newStatus}`);
        loadBookings();
      } else {
        toast.error(result.error || 'Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const loadExchangeRates = async () => {
    try {
      console.log('Loading exchange rates from database...');
      const result = await getAllExchangeRates();
      console.log('Exchange rates result:', result);
      if (result.success && result.rates) {
        console.log('Setting database rates:', result.rates);
        setDatabaseRates(result.rates);
      } else {
        console.warn('Failed to load rates or no rates returned:', result);
      }
    } catch (error) {
      console.error('Error loading exchange rates:', error);
    }
  };

  const loadUsersAndTransactions = async () => {
    try {
      // Simulate loading users from database
      // In real scenario, create getAllUsers endpoint
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', wallet_balance: 5000, preferred_currency: 'USD', created_at: '2024-12-15' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', wallet_balance: 3500, preferred_currency: 'USD', created_at: '2024-12-20' },
        { id: 3, name: 'Admin User', email: 'admin@example.com', role: 'admin', wallet_balance: 10000, preferred_currency: 'USD', created_at: '2024-12-01' },
      ];
      setAllUsers(mockUsers);

      // Simulate transaction logs
      const mockTransactions = [
        { id: 1, type: 'booking', user_email: 'john@example.com', amount: 2598, currency: 'USD', status: 'success', description: 'Booking: Tropical Paradise', created_at: '2024-12-25' },
        { id: 2, type: 'deposit', user_email: 'jane@example.com', amount: 500, currency: 'USD', status: 'success', description: 'Wallet Deposit', created_at: '2024-12-24' },
        { id: 3, type: 'exchange', user_email: 'john@example.com', amount: 1000, currency: 'NGN', status: 'success', description: 'Currency Exchange: USD to NGN', created_at: '2024-12-23' },
        { id: 4, type: 'booking', user_email: 'jane@example.com', amount: 8598, currency: 'USD', status: 'success', description: 'Booking: Maldives Luxury', created_at: '2024-12-22' },
      ];
      setAllTransactions(mockTransactions);
    } catch (error) {
      console.error('Error loading users and transactions:', error);
    }
  };

  const handleOpenRateModal = (rate?: ExchangeRateData) => {
    if (rate) {
      setEditingRate(rate);
      setRateFormData(rate);
    } else {
      setEditingRate(null);
      setRateFormData({
        code: '',
        name: '',
        rate: 0,
        buy_rate: 0,
        sell_rate: 0,
        flag: '',
      });
    }
    setShowRateModal(true);
  };

  const handleCloseRateModal = () => {
    setShowRateModal(false);
    setEditingRate(null);
  };

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rateFormData.code || !rateFormData.name || rateFormData.rate === undefined || rateFormData.buy_rate === undefined || rateFormData.sell_rate === undefined) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      let result;
      if (editingRate?.id) {
        // Update existing rate
        result = await updateExchangeRate(editingRate.id, rateFormData);
      } else {
        // Create new rate
        result = await createExchangeRate(rateFormData);
      }
      
      if (result.success) {
        toast.success(editingRate ? 'Exchange rate updated successfully' : 'Exchange rate created successfully');
        handleCloseRateModal();
        loadExchangeRates();
      } else {
        toast.error(result.error || 'Failed to save exchange rate');
      }
    } catch (error) {
      console.error('Error saving exchange rate:', error);
      toast.error('Failed to save exchange rate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRate = async (id: number, code: string) => {
    if (confirm(`Are you sure you want to delete ${code}?`)) {
      setIsLoading(true);
      try {
        const result = await deleteExchangeRate(id);
        if (result.success) {
          toast.success('Exchange rate deleted successfully');
          loadExchangeRates();
        } else {
          toast.error(result.error || 'Failed to delete exchange rate');
        }
      } catch (error) {
        console.error('Error deleting exchange rate:', error);
        toast.error('Failed to delete exchange rate');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOpenModal = (tour?: TourData) => {
    if (tour) {
      setEditingTour(tour);
      setFormData(tour);
    } else {
      setEditingTour(null);
      setFormData({
        name: '',
        destination: '',
        country: '',
        price: 0,
        duration: '',
        category: 'adventure',
        rating: 0,
        description: '',
        itinerary: [],
        included: [],
        excluded: [],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTour(null);
  };

  const handleSaveTour = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.destination || !formData.country || formData.price === undefined) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      let result;
      if (editingTour?.id) {
        result = await updateTour(editingTour.id, formData);
        if (result.success) {
          toast.success('Tour updated successfully');
        } else {
          toast.error(result.error || 'Failed to update tour');
        }
      } else {
        result = await createTour(formData as TourData);
        if (result.success) {
          toast.success('Tour created successfully');
        } else {
          toast.error(result.error || 'Failed to create tour');
        }
      }

      if (result.success) {
        handleCloseModal();
        await loadTours();
      }
    } catch (error) {
      console.error('Error saving tour:', error);
      toast.error('An error occurred while saving the tour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTour = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tour?')) return;

    setIsLoading(true);
    try {
      const result = await deleteTour(id);
      if (result.success) {
        toast.success('Tour deleted successfully');
        await loadTours();
      } else {
        toast.error(result.error || 'Failed to delete tour');
      }
    } catch (error) {
      console.error('Error deleting tour:', error);
      toast.error('An error occurred while deleting the tour');
    } finally {
      setIsLoading(false);
    }
  };

  const displayTours = databaseTours.length > 0 ? databaseTours : tours;

  const curr = selectedCurrency ?? 'USD';
  // Calculate stats from database
  const totalRevenue = databaseBookings.reduce((sum, booking) => {
    const price = typeof booking.total_price === 'string' ? parseFloat(booking.total_price) : booking.total_price;
    return sum + (price || 0);
  }, 0);
  
  const totalBookings = databaseBookings.length;
  const activeTours = databaseTours.length;
  const completedBookings = databaseBookings.filter(b => b.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Hero Image */}
      <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=400&fit=crop")'
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <Button
            onClick={() => onNavigate('home')}
            variant="ghost"
            className="mb-4 text-white hover:bg-white/10 gap-2 border border-white"
          >
            <ChevronLeft/> Back to Website
          </Button>
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">Manage tours, bookings, and exchange rates</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <arSign className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-600 mt-2">From {totalBookings} bookings</p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900">{totalBookings}</p>
            <p className="text-xs text-green-600 mt-2">{completedBookings} completed</p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Plane className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Active Tours</p>
            <p className="text-3xl font-bold text-gray-900">{activeTours}</p>
            <p className="text-xs text-gray-600 mt-2">From database</p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Exchange Rates</p>
            <p className="text-3xl font-bold text-gray-900">{databaseRates.length}</p>
            <p className="text-xs text-gray-600 mt-2">Active currencies</p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tours" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-5">
            <TabsTrigger value="tours">Manage Tours</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="rates">Rates</TabsTrigger>
          </TabsList>

          {/* Tours Tab */}
          <TabsContent value="tours" className="mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Tour Management</h2>
                <Button 
                  onClick={() => handleOpenModal()} 
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4" />
                  Add New Tour
                </Button>
              </div>

              {isLoading && <p className="text-gray-600 mb-4">Loading tours...</p>}

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tour Name</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayTours.map((tour) => (
                      <TableRow key={tour.id}>
                        <TableCell className="font-medium">{tour.name}</TableCell>
                        <TableCell>{tour.destination}, {tour.country}</TableCell>
                        <TableCell>${typeof tour.price === 'string' ? parseFloat(tour.price).toFixed(2) : tour.price?.toFixed(2)}</TableCell>
                        <TableCell>{tour.duration}</TableCell>
                        <TableCell>{tour.rating || 0} ⭐</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {tour.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="gap-1"
                              onClick={() => handleOpenModal(tour)}
                              disabled={isLoading}
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="gap-1 text-red-600 hover:text-red-700"
                              onClick={() => tour.id && handleDeleteTour(tour.id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          {/* Bookings Tab */}
          <TabsContent value="bookings" className="mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Tour Bookings ({databaseBookings.length})</h2>
                <div className="flex gap-2">
                  <select
                    value={bookingFilter}
                    onChange={(e) => setBookingFilter(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 cursor-pointer gap-2"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {databaseBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No bookings found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Booking ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Tour</TableHead>
                        <TableHead>Travel Date</TableHead>
                        <TableHead>Travelers</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {databaseBookings
                        .filter(b => bookingFilter === 'all' || b.status === bookingFilter)
                        .map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">#{booking.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{booking.user_name}</p>
                              <p className="text-sm text-gray-500">{booking.user_email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{booking.tour_name}</TableCell>
                          <TableCell>{new Date(booking.travel_date).toLocaleDateString()}</TableCell>
                          <TableCell>{booking.number_of_travelers}</TableCell>
                          <TableCell className="font-semibold">${typeof booking.total_price === 'string' ? parseFloat(booking.total_price).toFixed(2) : booking.total_price?.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              className={`text-white font-medium ${
                                booking.status === 'completed'
                                  ? 'bg-blue-500 hover:bg-blue-600'
                                  : booking.status === 'confirmed'
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : booking.status === 'pending'
                                  ? 'bg-orange-500 hover:bg-orange-600'
                                  : booking.status === 'cancelled'
                                  ? 'bg-red-500 hover:bg-red-600'
                                  : 'bg-gray-500 hover:bg-gray-600'
                              }`}
                            >
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedBooking(booking)}
                              >
                                <FileText className="w-3 h-3" />
                              </Button>
                              <select
                                value={booking.status}
                                onChange={(e) => handleUpdateBookingStatus(booking.id!, e.target.value as any)}
                                className="px-2 py-1 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 cursor-pointer"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>

            {/* Booking Detail Modal */}
            {selectedBooking && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-2xl">
                  <div className="p-6 flex justify-between items-center border-b">
                    <h2 className="text-2xl font-bold">Booking Details</h2>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setSelectedBooking(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Booking ID</p>
                        <p className="font-bold">#{selectedBooking.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <Badge className={`text-white font-medium ${
                          selectedBooking.status === 'completed' ? 'bg-blue-500' :
                          selectedBooking.status === 'confirmed' ? 'bg-green-500' :
                          selectedBooking.status === 'pending' ? 'bg-orange-500' : 'bg-red-500'
                        }`}>
                          {selectedBooking.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Customer Name</p>
                        <p className="font-medium">{selectedBooking.user_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Customer Email</p>
                        <p className="text-sm">{selectedBooking.user_email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tour</p>
                        <p className="font-medium">{selectedBooking.tour_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Travel Date</p>
                        <p className="font-medium">{new Date(selectedBooking.travel_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Travelers</p>
                        <p className="font-medium">{selectedBooking.number_of_travelers}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-lg font-bold text-blue-600">${typeof selectedBooking.total_price === 'string' ? parseFloat(selectedBooking.total_price).toFixed(2) : selectedBooking.total_price?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payment Method</p>
                        <p className="font-medium capitalize">{selectedBooking.payment_method}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Booking Date</p>
                        <p className="text-sm">{new Date(selectedBooking.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">User Management ({allUsers.length})</h2>
              </div>

              {allUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Wallet Balance</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Member Since</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge className={user.role === 'admin' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">${user.wallet_balance.toFixed(2)}</TableCell>
                          <TableCell>{user.preferred_currency}</TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Transaction Logs ({allTransactions.length})</h2>
                <div className="flex gap-2">
                  <select
                    value={transactionFilter}
                    onChange={(e) => setTransactionFilter(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <option value="all">All Types</option>
                    <option value="booking">Bookings</option>
                    <option value="deposit">Deposits</option>
                    <option value="exchange">Exchanges</option>
                  </select>
                  <Button className="gap-2 bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              </div>

              {allTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No transactions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>User Email</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allTransactions
                        .filter(t => transactionFilter === 'all' || t.type === transactionFilter)
                        .map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">#{transaction.id}</TableCell>
                          <TableCell>
                            <Badge className={
                              transaction.type === 'booking' ? 'bg-blue-500' :
                              transaction.type === 'deposit' ? 'bg-green-500' :
                              'bg-purple-500'
                            }>
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{transaction.user_email}</TableCell>
                          <TableCell className="font-semibold">${typeof transaction.amount === 'string' ? parseFloat(transaction.amount).toFixed(2) : transaction.amount?.toFixed(2)}</TableCell>
                          <TableCell>{transaction.currency}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <Badge className={transaction.status === 'success' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Exchange Rates Tab */}
          <TabsContent value="rates" className="mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Currency Exchange Rates ({databaseRates.length})</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage and update exchange rates</p>
                </div>
                <Button 
                  onClick={() => handleOpenRateModal()}
                  className="bg-blue-600 hover:bg-blue-700 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Rate
                </Button>
              </div>

              {databaseRates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No exchange rates found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Rate (NGN)</TableHead>
                        <TableHead>Buy Rate</TableHead>
                        <TableHead>Sell Rate</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {databaseRates.map((rate) => (
                        <TableRow key={rate.id}>
                          <TableCell className="font-medium">{rate.code}</TableCell>
                          <TableCell>{rate.name}</TableCell>
                          <TableCell>{typeof rate.rate === 'string' ? parseFloat(rate.rate).toFixed(4) : rate.rate?.toFixed(4)}</TableCell>
                          <TableCell>{typeof rate.buy_rate === 'string' ? parseFloat(rate.buy_rate).toFixed(4) : rate.buy_rate?.toFixed(4)}</TableCell>
                          <TableCell>{typeof rate.sell_rate === 'string' ? parseFloat(rate.sell_rate).toFixed(4) : rate.sell_rate?.toFixed(4)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleOpenRateModal(rate)}
                                disabled={isLoading}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteRate(rate.id!, rate.code)}
                                disabled={isLoading}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Exchange Rate Edit/Create Modal */}
      {showRateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">
                {editingRate ? 'Edit Exchange Rate' : 'Add Exchange Rate'}
              </h2>
              <button 
                onClick={handleCloseRateModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveRate} className="p-6 space-y-4">
              <div>
                <Label htmlFor="code">Currency Code *</Label>
                <Input
                  id="code"
                  placeholder="e.g., EUR"
                  value={rateFormData.code || ''}
                  onChange={(e) => setRateFormData({ ...rateFormData, code: e.target.value.toUpperCase() })}
                  disabled={!!editingRate}
                  maxLength={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="name">Currency Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Euro"
                  value={rateFormData.name || ''}
                  onChange={(e) => setRateFormData({ ...rateFormData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="rate">Exchange Rate (Naira) *</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.0001"
                  placeholder="e.g., 1500"
                  value={rateFormData.rate || ''}
                  onChange={(e) => setRateFormData({ ...rateFormData, rate: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="buy_rate">Buy Rate *</Label>
                  <Input
                    id="buy_rate"
                    type="number"
                    step="0.0001"
                    placeholder="e.g., 0.91"
                    value={rateFormData.buy_rate || ''}
                    onChange={(e) => setRateFormData({ ...rateFormData, buy_rate: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sell_rate">Sell Rate *</Label>
                  <Input
                    id="sell_rate"
                    type="number"
                    step="0.0001"
                    placeholder="e.g., 0.93"
                    value={rateFormData.sell_rate || ''}
                    onChange={(e) => setRateFormData({ ...rateFormData, sell_rate: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="flag">Flag Emoji (optional)</Label>
                <Input
                  id="flag"
                  placeholder="e.g., 🇪🇺"
                  value={rateFormData.flag || ''}
                  onChange={(e) => setRateFormData({ ...rateFormData, flag: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseRateModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Rate'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Tour Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">
                {editingTour ? 'Edit Tour' : 'Create New Tour'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveTour} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Tour Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Mountain Adventure"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="destination">Destination *</Label>
                  <Input
                    id="destination"
                    placeholder="e.g., Swiss Alps"
                    value={formData.destination || ''}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    placeholder="e.g., Switzerland"
                    value={formData.country || ''}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price || 0}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 7 Days"
                    value={formData.duration || ''}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category || 'adventure'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="adventure">Adventure</option>
                    <option value="cultural">Cultural</option>
                    <option value="beach">Beach</option>
                    <option value="wildlife">Wildlife</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rating">Rating (0-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating || 0}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="image">Tour Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  placeholder="Tour description..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="groupSize">Group Size (max travelers)</Label>
                <Input
                  id="groupSize"
                  type="number"
                  min="1"
                  placeholder="e.g., 20"
                  value={formData.groupSize || ''}
                  onChange={(e) => setFormData({ ...formData, groupSize: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="itinerary">Itinerary (comma-separated activities)</Label>
                <textarea
                  id="itinerary"
                  placeholder="Day 1: Activity A, Day 2: Activity B, etc..."
                  value={Array.isArray(formData.itinerary) ? formData.itinerary.join(', ') : ''}
                  onChange={(e) => setFormData({ ...formData, itinerary: e.target.value.split(',').map(item => item.trim()).filter(Boolean) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="included">What's Included (comma-separated items)</Label>
                <textarea
                  id="included"
                  placeholder="Accommodation, meals, transport, guide, etc..."
                  value={Array.isArray(formData.included) ? formData.included.join(', ') : ''}
                  onChange={(e) => setFormData({ ...formData, included: e.target.value.split(',').map(item => item.trim()).filter(Boolean) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="excluded">What's NOT Included (comma-separated items)</Label>
                <textarea
                  id="excluded"
                  placeholder="Airfare, travel insurance, personal expenses, etc..."
                  value={Array.isArray(formData.excluded) ? formData.excluded.join(', ') : ''}
                  onChange={(e) => setFormData({ ...formData, excluded: e.target.value.split(',').map(item => item.trim()).filter(Boolean) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : editingTour ? 'Update Tour' : 'Create Tour'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}