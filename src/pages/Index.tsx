import { useState, useEffect } from "react";
import { Search, MapPin, Phone, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

interface SearchResult {
  medicine: {
    name: string;
    price: number;
    stock_quantity: number;
  };
  shop: {
    name: string;
    address: string;
    phone: string | null;
    latitude: number | null;
    longitude: number | null;
  };
}

interface LocationDetails {
  area: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
}

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

const Index = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [userLocation, setUserLocation] = useState<LocationDetails | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    clearTimeout(Number(localStorage.getItem('searchTimeout')));
    const timeoutId = setTimeout(() => setDebouncedQuery(value), 500);
    localStorage.setItem('searchTimeout', timeoutId.toString());
  };

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    toast({
      title: "Getting your location",
      description: "Please wait while we detect your precise location...",
    });
    
    if ("geolocation" in navigator) {
      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            console.log("Raw coordinates:", latitude, longitude);
            
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?` +
              `format=json&lat=${latitude}&lon=${longitude}&` +
              `addressdetails=1&zoom=18&accept-language=en`
            );
            
            if (!response.ok) {
              throw new Error('Failed to fetch location details');
            }

            const data = await response.json();
            console.log("Location data from API:", data);
            
            const area = data.address.suburb || 
                        data.address.neighbourhood || 
                        data.address.residential || 
                        data.address.city_district ||
                        data.address.city ||
                        "Unknown Area";
                        
            const pincode = data.address.postcode || "Unknown Pincode";

            if (!area || !pincode) {
              throw new Error('Could not determine precise location');
            }
            
            setUserLocation({
              area,
              pincode,
              latitude,
              longitude
            });

            toast({
              title: "Location detected",
              description: `${area}, ${pincode}`,
            });
          } catch (error) {
            console.error("Error getting location details:", error);
            
            setUserLocation({
              area: "Unknown Area",
              pincode: "Unknown Pincode",
              latitude: latitude,
              longitude: longitude
            });
            
            toast({
              variant: "destructive",
              title: "Error getting detailed location",
              description: "Using coordinates for search. Please try again later.",
            });
          } finally {
            setIsLoadingLocation(false);
          }
        },
        (error) => {
          setIsLoadingLocation(false);
          console.error("Geolocation error:", error);
          
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
      setIsLoadingLocation(false);
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

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['medicineSearch', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      
      const { data, error } = await supabase
        .from('medicines')
        .select(`
          name,
          price,
          stock_quantity,
          shops (
            name,
            address,
            phone,
            latitude,
            longitude
          )
        `)
        .ilike('name', `%${debouncedQuery}%`);

      if (error) throw error;

      if (data && userLocation?.latitude && userLocation?.longitude) {
        return data.sort((a, b) => {
          if (!a.shops?.latitude || !a.shops?.longitude || !b.shops?.latitude || !b.shops?.longitude) {
            return 0;
          }
          
          const distanceA = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            a.shops.latitude,
            a.shops.longitude
          );
          
          const distanceB = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            b.shops.latitude,
            b.shops.longitude
          );
          
          return distanceA - distanceB;
        });
      }

      return data || [];
    },
    enabled: debouncedQuery.length > 0
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            Find Medicine Near You
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            Search for medicines, locate nearby stores, and order online with ease.
          </p>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg inline-block">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={16} className="text-medical-600" />
              {isLoadingLocation ? (
                <span>Detecting your location...</span>
              ) : userLocation ? (
                <>
                  <span>Your location: {userLocation.area}, {userLocation.pincode}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={getCurrentLocation}
                    className="text-medical-600 hover:text-medical-700"
                    disabled={isLoadingLocation}
                  >
                    Update
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Location not detected</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={getCurrentLocation}
                    className="text-medical-600 hover:text-medical-700"
                    disabled={isLoadingLocation}
                  >
                    Detect Location
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="relative max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for medicines..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-6 py-4 text-lg border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent shadow-sm"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-medical-500 text-white p-3 rounded-full hover:bg-medical-600 transition-colors">
                <Search size={24} />
              </button>
            </div>
            
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-10"
              >
                {isLoading ? (
                  <div className="p-4">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
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

                      return (
                        <div key={index} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-gray-900">{result.name}</h3>
                            <span className="text-medical-600 font-medium">
                              ₹{result.price.toFixed(2)}
                            </span>
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
                                  {result.shops.phone}
                                </p>
                              )}
                              <p className="mt-1 text-xs text-gray-500">
                                Stock available: {result.stock_quantity}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No medicines found matching your search
                  </div>
                )}
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-medical-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Search className="text-medical-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Search Medicines</h3>
              <p className="text-gray-600">Find medicines quickly with our smart search system.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-medical-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <MapPin className="text-medical-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Locate Stores</h3>
              <p className="text-gray-600">Find nearby medical stores with real-time availability.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-medical-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Phone className="text-medical-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Doctor Consult</h3>
              <p className="text-gray-600">Connect with qualified doctors for expert advice.</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
