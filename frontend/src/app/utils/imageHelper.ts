/**
 * Get the full image URL for a tour image
 * Handles both database-stored images and mock data images
 */
export function getTourImageUrl(imagePath: string | undefined): string {
  if (!imagePath) {
    // Return a placeholder image if no path is provided
    return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop';
  }

  // If it's already a full URL (http/https), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a database-stored image path, construct the full URL
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const baseUrl = apiBaseUrl.replace('/api', '');
  return `${baseUrl}/storage/${imagePath}`;
}
