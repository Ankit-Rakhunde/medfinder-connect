
import React from "react";
import { MapPin } from "lucide-react";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import { LocationError } from "./LocationError";
import { LocationDisplay } from "./LocationDisplay";
import { LocationButton } from "./LocationButton";
import { LocationLoading } from "./LocationLoading";

export interface LocationDetectorProps {
  userLocation: LocationDetails | null;
  setUserLocation: (location: LocationDetails | null) => void;
  isLoadingLocation: boolean;
  setIsLoadingLocation: (isLoading: boolean) => void;
}

// Re-export LocationDetails from the hook for backward compatibility
export type { LocationDetails } from "@/hooks/useLocationDetection";

export const LocationDetector = ({ 
  userLocation, 
  setUserLocation, 
  isLoadingLocation, 
  setIsLoadingLocation 
}: LocationDetectorProps) => {
  const {
    locationError,
    retryCount,
    getCurrentLocation
  } = useLocationDetection();

  // We'll use the hook's getCurrentLocation but update the props' state
  const handleGetLocation = () => {
    getCurrentLocation();
  };

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg inline-block w-full max-w-md shadow-sm border border-gray-100">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={16} className="text-medical-600" />
          <span className="font-medium">Your Location</span>
        </div>
        
        <LocationError error={locationError} />
        
        {isLoadingLocation ? (
          <LocationLoading />
        ) : userLocation ? (
          <LocationDisplay 
            userLocation={userLocation} 
            onRefresh={handleGetLocation} 
            isLoading={isLoadingLocation}
          />
        ) : (
          <LocationButton 
            onClick={handleGetLocation} 
            isLoading={isLoadingLocation}
            retryCount={retryCount}
          />
        )}
      </div>
    </div>
  );
};
