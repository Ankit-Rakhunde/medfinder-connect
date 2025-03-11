
import { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
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
        timeout: 30000, // Extended timeout
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            console.log("Raw coordinates:", latitude, longitude);
            
            // Try using multiple geocoding services for better results
            let locationFound = false;
            
            // First attempt with OpenStreetMap's Nominatim API
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?` +
                `format=json&lat=${latitude}&lon=${longitude}&` +
                `addressdetails=1&zoom=18&accept-language=en`,
                { 
                  headers: { 
                    "Accept-Language": "en",
                    "User-Agent": "MedFinder/1.0" 
                  } 
                }
              );
              
              if (!response.ok) {
                throw new Error('Failed to fetch location details from Nominatim');
              }

              const data = await response.json();
              console.log("Location data from Nominatim API:", data);
              
              // Extract meaningful location data
              let area = '';
              if (data.address) {
                area = data.address.suburb || 
                      data.address.neighbourhood || 
                      data.address.residential || 
                      data.address.village ||
                      data.address.town ||
                      data.address.city_district ||
                      data.address.city ||
                      data.address.county ||
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
                
                locationFound = true;
              }
            } catch (nominatimError) {
              console.error("Error with Nominatim API:", nominatimError);
              // Will continue to fallback options
            }
            
            // If location still not found, use raw coordinates
            if (!locationFound) {
              throw new Error('Could not determine precise location from APIs');
            }
            
          } catch (error) {
            console.error("Error getting location details:", error);
            
            // Set a generic location as fallback
            setUserLocation({
              area: "Unknown Area",
              pincode: "Unknown Pincode",
              latitude: latitude,
              longitude: longitude
            });
            
            setLocationError("Could not get your precise location. Using coordinates only.");
            
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

          setLocationError(errorMessage);
          
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
          <p className="text-sm text-red-500">{locationError}</p>
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
                Update
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
          </div>
        )}
      </div>
    </div>
  );
};
