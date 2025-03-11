
import React from "react";
import { Loader2 } from "lucide-react";

export const LocationLoading = () => {
  return (
    <div className="flex items-center gap-2 text-sm py-1">
      <Loader2 size={16} className="animate-spin text-medical-600" />
      <span>Detecting your location...</span>
    </div>
  );
};
