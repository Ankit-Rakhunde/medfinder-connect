
import React from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationButtonProps {
  onClick: () => void;
  isLoading: boolean;
  retryCount: number;
}

export const LocationButton = ({ 
  onClick, 
  isLoading,
  retryCount 
}: LocationButtonProps) => {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">We need your location to find medicines nearby</p>
      <Button
        variant="default"
        size="sm"
        onClick={onClick}
        className="bg-medical-600 hover:bg-medical-700 text-white"
        disabled={isLoading}
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
  );
};
