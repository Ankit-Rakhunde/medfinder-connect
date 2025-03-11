
import React from "react";
import { CheckCircle, MapIcon, Hash, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationDetails } from "@/hooks/useLocationDetection";

interface LocationDisplayProps {
  userLocation: LocationDetails;
  onRefresh: () => void;
  isLoading: boolean;
}

export const LocationDisplay = ({ 
  userLocation, 
  onRefresh, 
  isLoading 
}: LocationDisplayProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <div className="bg-medical-50 rounded-md p-3 mb-2 inline-flex items-center gap-2">
          <CheckCircle size={16} className="text-medical-600" />
          <span className="text-sm font-medium text-medical-900">Location Detected</span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <MapIcon size={14} className="text-medical-600" />
            <p className="text-sm font-semibold">{userLocation.area}</p>
          </div>
          <div className="flex items-center gap-2 ml-6">
            <Hash size={14} className="text-medical-600" />
            <p className="text-sm text-gray-700">{userLocation.pincode}</p>
          </div>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        className="text-medical-600 hover:text-medical-700 hover:bg-medical-50 transition-colors"
        disabled={isLoading}
      >
        <RefreshCw size={14} className="mr-1" />
        Refresh
      </Button>
    </div>
  );
};
