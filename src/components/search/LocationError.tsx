
import React from "react";

interface LocationErrorProps {
  error: string | null;
}

export const LocationError = ({ error }: LocationErrorProps) => {
  if (!error) return null;
  
  return (
    <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>
  );
};
