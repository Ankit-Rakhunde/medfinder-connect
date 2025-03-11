
import { useState } from "react";
import { MapPin, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

export interface LocationDetails {
  area: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
}

interface LocationDetectorProps {
  userLocation: LocationDetails | null;
  setUserLocation: (location: LocationDetails | null) => void;
  isLoadingLocation: boolean;
  setIsLoadingLocation: (isLoading: boolean) => void;
}

export const LocationDetector = ({ 
  userLocation, 
  setUserLocation, 
  isLoadingLocation, 
  setIsLoadingLocation 
}: LocationDetectorProps) => {
  const { toast } = useToast();
  const [locationError, setLocationError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    
    toast({
      title: "Getting your location",
      description: "Please wait while we detect your precise location...",
    });
    
    if ("geolocation" in navigator) {
      const options = {
        enableHighAccuracy: true,
        timeout: 30000, 
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Raw coordinates:", latitude, longitude);
          
          try {
            // Try OpenStreetMap's Nominatim API with more specific headers
            const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18&accept-language=en`;
            
            const response = await fetch(nominatimUrl, { 
              headers: { 
                "Accept-Language": "en",
                "User-Agent": "MedFinder/1.0" 
              } 
            });
            
            if (!response.ok) {
              throw new Error('Failed to fetch location details from Nominatim');
            }

            const data = await response.json();
            console.log("Location data from Nominatim API:", data);
            
            if (data && data.address) {
              // Extract meaningful location data with more fallbacks
              const area = data.address.suburb || 
                    data.address.neighbourhood || 
                    data.address.residential || 
                    data.address.village ||
                    data.address.town ||
                    data.address.city_district ||
                    data.address.city ||
                    data.address.county ||
                    data.display_name?.split(',')[0] ||
                    "Unknown Area";
                      
              const pincode = data.address.postcode || "Unknown Pincode";

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
              
              setRetryCount(0); // Reset retry count on success
            } else {
              throw new Error('Invalid location data structure');
            }
          } catch (error) {
            console.error("Error getting location details:", error);
            
            // Fallback to using raw coordinates
            setUserLocation({
              area: "Unknown Area",
              pincode: "Unknown Pincode",
              latitude: latitude,
              longitude: longitude
            });
            
            setLocationError("Could not get your precise location details. Using coordinates only.");
            
            toast({
              variant: "destructive",
              title: "Error getting detailed location",
              description: "Using coordinates for search. You can retry for better results.",
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
              errorMessage = "Please enable location services in your browser settings";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable. Please try again";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please try again";
              break;
          }

          setLocationError(errorMessage);
          
          toast({
            variant: "destructive",
            title: "Error getting location",
            description: errorMessage,
          });

          // Increment retry count
          setRetryCount(prevCount => prevCount + 1);
        },
        options
      );
    } else {
      setIsLoadingLocation(false);
      setLocationError("Your browser doesn't support location services");
      
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services.",
      });
    }
  };

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg inline-block w-full max-w-md shadow-sm border border-gray-100">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={16} className="text-medical-600" />
          <span className="font-medium">Your Location</span>
        </div>
        
        {locationError && (
          <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{locationError}</p>
        )}
        
        {isLoadingLocation ? (
          <div className="flex items-center gap-2 text-sm py-1">
            <Loader2 size={16} className="animate-spin text-medical-600" />
            <span>Detecting your location...</span>
          </div>
        ) : userLocation ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{userLocation.area}</p>
                <p className="text-xs text-gray-500">{userLocation.pincode}</p>
                {userLocation.latitude && userLocation.longitude && (
                  <p className="text-xs text-gray-400 mt-1">
                    Coordinates: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                className="text-medical-600 hover:text-medical-700"
                disabled={isLoadingLocation}
              >
                <RefreshCw size={14} className="mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm">We need your location to find medicines nearby</p>
            <Button
              variant="default"
              size="sm"
              onClick={getCurrentLocation}
              className="bg-medical-600 hover:bg-medical-700 text-white"
              disabled={isLoadingLocation}
            >
              <MapPin size={16} className="mr-2" />
              Detect My Location
            </Button>
            {retryCount > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Having trouble? Make sure you've granted location permissions and try refreshing the page.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
