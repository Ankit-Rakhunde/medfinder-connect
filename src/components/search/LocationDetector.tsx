
import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

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

  return (
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
  );
};
