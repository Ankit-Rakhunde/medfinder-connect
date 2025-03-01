
import { useState, useEffect } from "react";
import { MapPin, Phone, ExternalLink } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";

interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  maps_link: string | null;
  created_at: string;
}

const Stores = () => {
  const { toast } = useToast();
  const [userCoordinates, setUserCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Get user's current location with improved accuracy
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if ("geolocation" in navigator) {
      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      };
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoordinates({ latitude, longitude });
          console.log("Location detected:", latitude, longitude);
          setIsGettingLocation(false);
          
          toast({
            title: "Location detected",
            description: "Showing stores nearest to your location",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsGettingLocation(false);
          
          let errorMessage = "Could not get your location";
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Please enable location services in your browser";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
          }
          
          toast({
            variant: "destructive",
            title: "Error getting location",
            description: errorMessage,
          });
        },
        options
      );
    } else {
      setIsGettingLocation(false);
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services.",
      });
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    
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

  // Fetch stores data
  const { data: shops, isLoading, error } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Shop[];
    }
  });

  // Sort shops by distance if user location is available
  const sortedShops = userCoordinates && shops 
    ? [...shops].sort((a, b) => {
        const distanceA = a.latitude && a.longitude 
          ? calculateDistance(userCoordinates.latitude, userCoordinates.longitude, a.latitude, a.longitude) 
          : Infinity;
        const distanceB = b.latitude && b.longitude 
          ? calculateDistance(userCoordinates.latitude, userCoordinates.longitude, b.latitude, b.longitude) 
          : Infinity;
        
        return (distanceA || Infinity) - (distanceB || Infinity);
      })
    : shops;

  if (error) {
    toast({
      variant: "destructive",
      title: "Error loading stores",
      description: "There was a problem loading the stores. Please try again later.",
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">
            Medical Stores
          </h1>

          <p className="text-lg text-gray-600 mb-8 text-center">
            Find medical stores near you and check their contact information.
          </p>
          
          <div className="flex justify-center mb-8">
            <Button 
              onClick={getCurrentLocation} 
              disabled={isGettingLocation}
              variant="outline"
              className="flex items-center gap-2"
            >
              <MapPin size={16} />
              {isGettingLocation ? "Detecting Location..." : userCoordinates ? "Update Location" : "Detect Location"}
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-8">
              {[1, 2, 3].map((item) => (
                <div key={item} className="animate-pulse p-6 bg-white rounded-xl shadow-sm">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : sortedShops && sortedShops.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {sortedShops.map((shop) => {
                let distance = null;
                if (userCoordinates && shop.latitude && shop.longitude) {
                  distance = calculateDistance(
                    userCoordinates.latitude,
                    userCoordinates.longitude,
                    shop.latitude,
                    shop.longitude
                  );
                }

                return (
                  <motion.div
                    key={shop.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">{shop.name}</h2>
                        <div className="space-y-2 text-gray-600">
                          <p className="flex items-start gap-2">
                            <MapPin className="text-medical-600 shrink-0 mt-1" size={18} />
                            <span>{shop.address}</span>
                            {distance && (
                              <span className="text-medical-600 font-medium ml-2">
                                ({distance.toFixed(1)} km away)
                              </span>
                            )}
                          </p>
                          {shop.phone && (
                            <p className="flex items-center gap-2">
                              <Phone className="text-medical-600" size={18} />
                              <a href={`tel:${shop.phone}`} className="hover:text-medical-600 transition-colors">
                                {shop.phone}
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {shop.maps_link && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={shop.maps_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                              <ExternalLink size={16} />
                              View on Maps
                            </a>
                          </Button>
                        )}
                        
                        {shop.latitude && shop.longitude && !shop.maps_link && (
                          <Button variant="outline" size="sm" asChild>
                            <a 
                              href={`https://www.google.com/maps?q=${shop.latitude},${shop.longitude}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1"
                            >
                              <ExternalLink size={16} />
                              View on Maps
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No stores found</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Stores;
