import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/input';
import { DestinationCard } from '../components/DestinationCard';
import { destinations as mockDestinations } from '../data/mockData';
import { getAllTours } from '../utils/tourService';
import { getTourImageUrl } from '../utils/imageHelper';
import type { TourData } from '../utils/tourService';

interface DestinationsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  tourCount: number;
}

export function DestinationsPage({ onNavigate }: DestinationsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setIsLoading(true);
        const result = await getAllTours();
        
        if (result.success && result.tours && result.tours.length > 0) {
          // Group tours by country and create unique destinations
          const destinationMap = new Map<string, { country: string; tours: TourData[] }>();
          
          result.tours.forEach((tour) => {
            if (!destinationMap.has(tour.country)) {
              destinationMap.set(tour.country, { country: tour.country, tours: [] });
            }
            destinationMap.get(tour.country)?.tours.push(tour);
          });

          // Convert map to destination array
          const uniqueDestinations = Array.from(destinationMap.entries()).map(
            ([key, value], index) => ({
              id: String(index + 1),
              name: value.country,
              country: value.country,
              description: `Explore ${value.tours.length} amazing tour${value.tours.length !== 1 ? 's' : ''} in ${value.country}`,
              image: getTourImageUrl(value.tours[0]?.image),
              tourCount: value.tours.length,
            })
          );

          setDestinations(uniqueDestinations);
          setUsingMockData(false);
          console.log('Loaded destinations from database:', uniqueDestinations.length);
        } else {
          // Fall back to mock data
          console.warn('Failed to fetch tours from API, using mock data');
          setDestinations(mockDestinations);
          setUsingMockData(true);
        }
      } catch (error) {
        console.error('Error fetching destinations:', error);
        setDestinations(mockDestinations);
        setUsingMockData(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const filteredDestinations = destinations.filter(
    (dest) =>
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewTours = (country: string) => {
    onNavigate('tours', { filterCountry: country });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center text-white overflow-hidden" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080")', backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/30" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl font-bold mb-6">Explore Our Destinations</h1>
          <p className="text-xl text-gray-100 mb-8">
            Discover amazing places around the world waiting for you to explore
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-white text-gray-900"
            />
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Loading destinations...</p>
            </div>
          ) : filteredDestinations.length > 0 ? (
            <>
              <div className="text-center mb-8">
                <p className="text-gray-600">
                  Showing {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? 's' : ''}
                </p>
                {usingMockData && (
                  <p className="text-sm text-gray-500 mt-2">📌 Showing demo destinations - database destinations will appear here when available</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredDestinations.map((destination) => (
                  <DestinationCard
                    key={destination.id}
                    destination={destination}
                    onViewTours={handleViewTours}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No destinations found matching your search.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
