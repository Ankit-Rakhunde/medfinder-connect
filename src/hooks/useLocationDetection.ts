
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface LocationDetails {
  area: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
}

export const useLocationDetection = () => {
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<LocationDetails | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
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

  return {
    userLocation,
    setUserLocation,
    isLoadingLocation,
    setIsLoadingLocation,
    locationError,
    setLocationError,
    retryCount,
    getCurrentLocation
  };
};
