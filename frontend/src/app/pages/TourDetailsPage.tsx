import { useState, useEffect } from 'react';
import { Star, Clock, MapPin, Check, X, Calendar, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { tours as mockTours } from '../data/mockData';
import { convertCurrency, formatCurrency } from '../utils/currencyConverter';
import { getTourById } from '../utils/tourService';
import { getTourImageUrl } from '../utils/imageHelper';
import type { TourData } from '../utils/tourService';

interface TourDetailsPageProps {
  tourId: string;
  onNavigate: (page: string, data?: any) => void;
  selectedCurrency?: string;
}

export function TourDetailsPage({ tourId, onNavigate, selectedCurrency = 'USD' }: TourDetailsPageProps) {
  const [tour, setTour] = useState<TourData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        setIsLoading(true);
        
        // Try to fetch from API using numeric ID
        const numericId = parseInt(tourId, 10);
        if (!isNaN(numericId)) {
          const result = await getTourById(numericId);
          
          if (result.success && result.tour) {
            setTour(result.tour);
            setUsingMockData(false);
            console.log('Loaded tour from database:', result.tour.id);
            return;
          }
        }
        
        // Fall back to mock data using string ID
        const mockTour = mockTours.find((t) => t.id === tourId);
        if (mockTour) {
          setTour(mockTour);
          setUsingMockData(true);
          console.log('Using mock tour data for ID:', tourId);
        } else {
          console.warn('Tour not found with ID:', tourId);
          setTour(null);
        }
      } catch (error) {
        console.error('Error fetching tour:', error);
        // Fall back to mock data
        const mockTour = mockTours.find((t) => t.id === tourId);
        if (mockTour) {
          setTour(mockTour);
          setUsingMockData(true);
        } else {
          setTour(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTour();
  }, [tourId]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-96 bg-gray-900">
        <img
          src={getTourImageUrl(tour.image)}
          alt={tour.name}
          className="w-full h-full object-cover opacity-90"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-white mb-2">
              <MapPin className="w-5 h-5" />
              <span>{tour.destination}, {tour.country}</span>
            </div>
            <div className="flex items-center justify-between">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{tour.name}</h1>
              {usingMockData && (
                <span className="text-sm bg-blue-500/70 px-3 py-1 rounded text-white">Demo Tour</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-white">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{tour.rating || 5} / 5</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{tour.duration}</span>
              </div>
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <span className="text-sm">From </span>
                <span className="text-2xl font-bold">{formatCurrency(convertCurrency(tour.price, 'USD', selectedCurrency), selectedCurrency)}</span>
                <span className="text-sm"> per person</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                <TabsTrigger value="included">What's Included</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Tour Description</h2>
                  <p className="text-gray-700 leading-relaxed">{tour.description}</p>
                </Card>
              </TabsContent>

              <TabsContent value="itinerary" className="mt-6">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Daily Itinerary</h2>
                  <div className="space-y-4">
                    {tour.itinerary && tour.itinerary.length > 0 ? (
                      tour.itinerary.map((item, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">{index + 1}</span>
                          </div>
                          <div className="flex-1 pt-1">
                            <p className="text-gray-700">{item}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No itinerary details available</p>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="included" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4 text-green-600 flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      Included
                    </h2>
                    <ul className="space-y-3">
                      {tour.included && tour.included.length > 0 ? (
                        tour.included.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No details available</p>
                      )}
                    </ul>
                  </Card>

                  <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4 text-red-600 flex items-center gap-2">
                      <X className="w-5 h-5" />
                      Not Included
                    </h2>
                    <ul className="space-y-3">
                      {tour.excluded && tour.excluded.length > 0 ? (
                        tour.excluded.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No details available</p>
                      )}
                    </ul>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-2">Starting from</p>
                <p className="text-4xl font-bold text-blue-600">{formatCurrency(convertCurrency(tour.price, 'USD', selectedCurrency), selectedCurrency)}</p>
                <p className="text-sm text-gray-500">per person</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Duration</p>
                    <p className="font-medium">{tour.duration}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Group Size</p>
                    <p className="font-medium"> {tour.groupSize || 15} people max</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Location</p>
                    <p className="font-medium">{tour.destination}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <div>
                    <p className="text-xs text-gray-600">Rating</p>
                    <p className="font-medium">{tour.rating} / 5.0</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => onNavigate('booking', { tourId: tour.id })}
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
              >
                Book This Tour
              </Button>

              <p className="text-xs text-center text-gray-500 mt-4">
                Best price guarantee • Free cancellation up to 24 hours before departure
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
