
import { MapPin, Phone, ExternalLink, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationDetails } from "./LocationDetector";
import { toast } from "@/hooks/use-toast";

interface SearchResultsProps {
  searchQuery: string;
  searchResults: any[] | null;
  isLoading: boolean;
  userLocation: LocationDetails | null;
}

export const SearchResults = ({ 
  searchQuery, 
  searchResults, 
  isLoading, 
  userLocation 
}: SearchResultsProps) => {
  
  // Helper function to calculate distance
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
  };

  // Helper function to generate Google Maps link
  const getGoogleMapsLink = (shop: any) => {
    if (shop.maps_link) return shop.maps_link;
    
    if (shop.latitude && shop.longitude) {
      return `https://www.google.com/maps?q=${shop.latitude},${shop.longitude}`;
    }
    
    return null;
  };

  // Function to handle adding item to cart
  const handleAddToCart = (medicine: any) => {
    // Get existing cart items from localStorage or initialize empty array
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if item already exists in cart
    const existingItemIndex = existingCart.findIndex(
      (item: any) => item.id === medicine.id
    );
    
    if (existingItemIndex >= 0) {
      // If item exists, increase quantity
      existingCart[existingItemIndex].quantity += 1;
      toast({
        title: "Quantity updated",
        description: `Added one more ${medicine.name} to your cart`,
      });
    } else {
      // If item doesn't exist, add it with quantity 1
      existingCart.push({
        id: medicine.id,
        name: medicine.name,
        price: medicine.price,
        quantity: 1,
        shop: medicine.shops ? medicine.shops.name : 'Unknown shop',
        shopId: medicine.shops ? medicine.shops.id : null
      });
      toast({
        title: "Added to cart",
        description: `${medicine.name} has been added to your cart`,
      });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Update cart count in Navigation if possible
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
      const totalItems = existingCart.reduce((total: number, item: any) => total + item.quantity, 0);
      cartCountElement.textContent = totalItems.toString();
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!searchResults || searchResults.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No medicines found matching your search
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {searchResults.map((result, index) => {
        let distance = null;
        if (userLocation?.latitude && userLocation?.longitude && result.shops?.latitude && result.shops?.longitude) {
          distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            result.shops.latitude,
            result.shops.longitude
          );
        }

        // Get the Google Maps link for this shop
        const mapsLink = result.shops ? getGoogleMapsLink(result.shops) : null;

        return (
          <div key={index} className="p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-900">{result.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-medical-600 font-medium">
                  ₹{result.price.toFixed(2)}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-medical-600 hover:bg-medical-50"
                  onClick={() => handleAddToCart(result)}
                >
                  <ShoppingCart size={14} className="mr-1" />
                  Add
                </Button>
              </div>
            </div>
            {result.shops && (
              <div className="text-sm text-gray-600">
                <p className="flex items-center gap-1">
                  <MapPin size={16} />
                  {result.shops.name} - {result.shops.address}
                  {distance && (
                    <span className="ml-2 text-medical-600">
                      ({distance.toFixed(1)} km away)
                    </span>
                  )}
                </p>
                {result.shops.phone && (
                  <p className="flex items-center gap-1 mt-1">
                    <Phone size={16} />
                    <a href={`tel:${result.shops.phone}`} className="hover:text-medical-600 transition-colors">
                      {result.shops.phone}
                    </a>
                  </p>
                )}
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Stock available: {result.stock_quantity}
                  </p>
                  {mapsLink && (
                    <Button variant="ghost" size="sm" className="flex items-center h-7 text-xs px-2 text-blue-600" asChild>
                      <a 
                        href={mapsLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <MapPin size={12} className="mr-1" />
                        View on Maps
                        <ExternalLink size={10} className="ml-1" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
